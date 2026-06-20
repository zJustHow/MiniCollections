package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.zjusthow.minicollections.model.BrandObjectSearchFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BrandObjectElasticsearchQueryService {

    private static final Logger log = LoggerFactory.getLogger(BrandObjectElasticsearchQueryService.class);
    private static final String FACET_AGG = "facet";
    private static final int MAX_CATEGORY_BUCKETS = 64;
    private static final int MAX_BRAND_BUCKETS = 64;
    private static final int MAX_SCALE_BUCKETS = 64;
    private static final int MAX_SERIES_BUCKETS = 64;

    private final ElasticsearchOperations elasticsearchOperations;
    private final SearchQuerySupport searchQuerySupport;

    public BrandObjectElasticsearchQueryService(
            ElasticsearchOperations elasticsearchOperations,
            SearchQuerySupport searchQuerySupport) {
        this.elasticsearchOperations = elasticsearchOperations;
        this.searchQuerySupport = searchQuerySupport;
    }

    private static final int MAX_RESULT_WINDOW = 10_000;

    public EsSearchPageResult searchPage(
            String keyword,
            BrandObjectSearchFilter filter,
            int page,
            int size) {
        if (keyword == null || keyword.isBlank() || size <= 0) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        int safePage = Math.max(page, 0);
        return searchAtOffset(keyword, filter, (long) safePage * size, size);
    }

    public EsSearchPageResult searchCount(String keyword, BrandObjectSearchFilter filter) {
        if (keyword == null || keyword.isBlank()) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        return countOnly(keyword.trim(), filter);
    }

    public EsSearchPageResult searchSlice(
            String keyword,
            BrandObjectSearchFilter filter,
            int offset,
            int size) {
        if (keyword == null || keyword.isBlank() || size <= 0) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        return searchAtOffset(keyword, filter, Math.max(offset, 0), size);
    }

    /**
     * Facet buckets use cross-dimension filters (each dimension excludes its own user selection).
     * Requires a non-blank keyword.
     */
    public EsSearchFacetsResult searchFacets(String keyword, BrandObjectSearchFilter filter) {
        if (keyword == null || keyword.isBlank()) {
            return new EsSearchFacetsResult(0L, List.of(), List.of(), List.of(), List.of());
        }
        String q = keyword.trim();
        try {
            long total = countTotal(q, filter);
            List<EsFacetBucket> categories = facetBuckets(
                    q, filter.forCategoryFacetBuckets(), "category_id", MAX_CATEGORY_BUCKETS);
            List<EsFacetBucket> brands = filter.scopeBrandId() == null
                    ? facetBuckets(q, filter.forBrandFacetBuckets(), "brand_id", MAX_BRAND_BUCKETS)
                    : List.of();
            List<EsFacetBucket> scales = facetBuckets(
                    q, filter.forScaleFacetBuckets(), "scale_id", MAX_SCALE_BUCKETS);
            List<EsFacetBucket> series = facetBuckets(
                    q, filter.forSeriesFacetBuckets(), "series_id", MAX_SERIES_BUCKETS);
            return new EsSearchFacetsResult(total, categories, brands, scales, series);
        } catch (Exception e) {
            log.warn("Elasticsearch search facets failed: {}", e.getMessage());
            throw e;
        }
    }

    private long countTotal(String q, BrandObjectSearchFilter filter) {
        var query = searchQuerySupport.countQuery(buildSearchQuery(q, filter), MAX_RESULT_WINDOW);
        SearchHits<BrandObjectDocument> hits =
                elasticsearchOperations.search(query, BrandObjectDocument.class);
        return hits.getTotalHits() >= 0 ? hits.getTotalHits() : 0L;
    }

    private List<EsFacetBucket> facetBuckets(
            String q,
            BrandObjectSearchFilter crossFilter,
            String field,
            int maxBuckets) {
        var query = searchQuerySupport.facetQuery(
                buildSearchQuery(q, crossFilter), FACET_AGG, field, maxBuckets, MAX_RESULT_WINDOW);
        SearchHits<BrandObjectDocument> hits =
                elasticsearchOperations.search(query, BrandObjectDocument.class);
        return searchQuerySupport.parseTermBuckets(hits, FACET_AGG);
    }

    private EsSearchPageResult searchAtOffset(
            String keyword,
            BrandObjectSearchFilter filter,
            long offset,
            int size) {
        if (keyword == null || keyword.isBlank()) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        String q = keyword.trim();
        int safeOffset = (int) Math.min(Math.max(offset, 0L), MAX_RESULT_WINDOW);
        int safeSize = Math.min(size, MAX_RESULT_WINDOW - safeOffset);
        if (safeSize <= 0) {
            return countOnly(q, filter);
        }
        var query = searchQuerySupport.pageQuery(
                buildSearchQuery(q, filter), safeOffset, safeSize, MAX_RESULT_WINDOW);
        return executePage(query);
    }

    private EsSearchPageResult countOnly(String q, BrandObjectSearchFilter filter) {
        var query = searchQuerySupport.countQuery(buildSearchQuery(q, filter), MAX_RESULT_WINDOW);
        return executePage(query);
    }

    private static final List<String> BRAND_OBJECT_SEARCH_FIELDS = List.of(
            "brand_name_en^3",
            "brand_abbreviation^3",
            "brand_name_zh^3",
            "name_en^2",
            "name_zh^2",
            "series_en",
            "series_zh",
            "category_en",
            "category_zh",
            "scale");

    private static final List<String> BRAND_OBJECT_SCOPED_SEARCH_FIELDS = List.of(
            "name_en^2", "name_zh^2", "series_en", "series_zh", "category_en", "category_zh", "scale");

    private Query buildSearchQuery(
            String q,
            BrandObjectSearchFilter filter) {
        if (!filter.hasUserFilters() && filter.scopeBrandId() == null) {
            return ElasticsearchSearchQueries.multiMatchWithCompactFallback(q, BRAND_OBJECT_SEARCH_FIELDS);
        }
        return searchQuerySupport.boolMustWithFilters(q, mustFields(filter), filter);
    }

    private List<String> mustFields(BrandObjectSearchFilter filter) {
        return filter.scopeBrandId() != null ? BRAND_OBJECT_SCOPED_SEARCH_FIELDS : BRAND_OBJECT_SEARCH_FIELDS;
    }

    private EsSearchPageResult executePage(org.springframework.data.elasticsearch.core.query.Query query) {
        try {
            SearchHits<BrandObjectDocument> hits =
                    elasticsearchOperations.search(query, BrandObjectDocument.class);
            List<Long> ids = new ArrayList<>();
            for (SearchHit<BrandObjectDocument> hit : hits) {
                if (hit.getContent() != null && hit.getContent().id() != null) {
                    ids.add(hit.getContent().id());
                }
            }
            long totalElements = hits.getTotalHits() >= 0 ? hits.getTotalHits() : ids.size();
            boolean totalExact = hits.getTotalHitsRelation().name().equals("EQUAL_TO");
            return new EsSearchPageResult(ids, totalElements, totalExact);
        } catch (Exception e) {
            log.warn("Elasticsearch query failed: {}", e.getMessage());
            throw e;
        }
    }
}
