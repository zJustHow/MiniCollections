package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregation;
import co.elastic.clients.elasticsearch._types.aggregations.LongTermsAggregate;
import co.elastic.clients.elasticsearch._types.aggregations.LongTermsBucket;
import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import com.zjusthow.minicollections.model.BrandObjectSearchFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
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

    public BrandObjectElasticsearchQueryService(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
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

    /** @deprecated use {@link #searchFacets(String, BrandObjectSearchFilter)} */
    public EsCategoryFacetsResult categoryFacets(String keyword, Long brandId) {
        BrandObjectSearchFilter filter = brandId == null
                ? BrandObjectSearchFilter.global(null, null, null, null)
                : BrandObjectSearchFilter.withinBrand(brandId, null, null, null);
        EsSearchFacetsResult result = searchFacets(keyword, filter);
        List<EsCategoryFacetBucket> categories = result.categories().stream()
                .map(b -> new EsCategoryFacetBucket(b.id(), b.count()))
                .toList();
        return new EsCategoryFacetsResult(result.total(), categories);
    }

    private long countTotal(String q, BrandObjectSearchFilter filter) {
        var nativeQuery = NativeQuery.builder()
                .withQuery(buildSearchQuery(q, filter))
                .withMaxResults(0)
                .withTrackTotalHitsUpTo(MAX_RESULT_WINDOW)
                .build();
        SearchHits<BrandObjectDocument> hits =
                elasticsearchOperations.search(nativeQuery, BrandObjectDocument.class);
        return hits.getTotalHits() >= 0 ? hits.getTotalHits() : 0L;
    }

    private List<EsFacetBucket> facetBuckets(
            String q,
            BrandObjectSearchFilter crossFilter,
            String field,
            int maxBuckets) {
        var nativeQuery = NativeQuery.builder()
                .withQuery(buildSearchQuery(q, crossFilter))
                .withMaxResults(0)
                .withAggregation(FACET_AGG, termsAgg(field, maxBuckets))
                .build();
        SearchHits<BrandObjectDocument> hits =
                elasticsearchOperations.search(nativeQuery, BrandObjectDocument.class);
        return parseTermBuckets(hits, FACET_AGG);
    }

    private Aggregation termsAgg(String field, int size) {
        return Aggregation.of(a -> a.terms(t -> t.field(field).size(size)));
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
        var nativeQuery = NativeQuery.builder()
                .withQuery(buildSearchQuery(q, filter))
                .withSort(s -> s.score(sc -> sc.order(SortOrder.Desc)))
                .withSort(s -> s.field(f -> f.field("id").order(SortOrder.Asc)))
                .withPageable(new OffsetPageRequest(safeOffset, safeSize))
                .withTrackTotalHitsUpTo(MAX_RESULT_WINDOW)
                .build();
        return executePage(nativeQuery);
    }

    private EsSearchPageResult countOnly(String q, BrandObjectSearchFilter filter) {
        var nativeQuery = NativeQuery.builder()
                .withQuery(buildSearchQuery(q, filter))
                .withMaxResults(0)
                .withTrackTotalHitsUpTo(MAX_RESULT_WINDOW)
                .build();
        return executePage(nativeQuery);
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

    private Query buildSearchQuery(String q, BrandObjectSearchFilter filter) {
        if (!filter.hasUserFilters() && filter.scopeBrandId() == null) {
            return Query.of(sq -> sq.multiMatch(m -> m
                    .query(q)
                    .fields(BRAND_OBJECT_SEARCH_FIELDS)
                    .type(TextQueryType.BestFields)
                    .operator(Operator.Or)));
        }
        return Query.of(sq -> sq.bool(b -> {
            if (filter.scopeBrandId() != null) {
                b.must(m -> m.multiMatch(mm -> mm
                        .query(q)
                        .fields("name_en^2", "name_zh^2", "series_en", "series_zh",
                                "category_en", "category_zh", "scale")
                        .type(TextQueryType.BestFields)
                        .operator(Operator.Or)));
                b.filter(f -> f.term(t -> t.field("brand_id").value(filter.scopeBrandId())));
            } else {
                b.must(m -> m.multiMatch(mm -> mm
                        .query(q)
                        .fields(BRAND_OBJECT_SEARCH_FIELDS)
                        .type(TextQueryType.BestFields)
                        .operator(Operator.Or)));
                if (filter.filterBrands()) {
                    b.filter(f -> f.terms(t -> t
                            .field("brand_id")
                            .terms(tv -> tv.value(toFieldValues(filter.brandIds())))));
                }
            }
            if (filter.filterCategories()) {
                b.filter(f -> f.terms(t -> t
                        .field("category_id")
                        .terms(tv -> tv.value(toFieldValues(filter.categoryIds())))));
            }
            if (filter.filterScales()) {
                b.filter(f -> f.terms(t -> t
                        .field("scale_id")
                        .terms(tv -> tv.value(toFieldValues(filter.scaleIds())))));
            }
            if (filter.filterSeries()) {
                b.filter(f -> f.terms(t -> t
                        .field("series_id")
                        .terms(tv -> tv.value(toFieldValues(filter.seriesIds())))));
            }
            return b;
        }));
    }

    private List<FieldValue> toFieldValues(List<Long> ids) {
        return ids.stream().map(FieldValue::of).toList();
    }

    private List<EsFacetBucket> parseTermBuckets(SearchHits<BrandObjectDocument> hits, String aggName) {
        if (hits.getAggregations() == null) {
            return List.of();
        }
        if (!(hits.getAggregations() instanceof ElasticsearchAggregations esAggs)) {
            return List.of();
        }
        ElasticsearchAggregation aggregation = esAggs.get(aggName);
        if (aggregation == null) {
            return List.of();
        }
        var aggregate = aggregation.aggregation().getAggregate();
        if (!aggregate.isLterms()) {
            return List.of();
        }
        LongTermsAggregate terms = aggregate.lterms();
        List<EsFacetBucket> buckets = new ArrayList<>();
        for (LongTermsBucket bucket : terms.buckets().array()) {
            if (bucket.key() != 0L) {
                buckets.add(new EsFacetBucket(bucket.key(), bucket.docCount()));
            }
        }
        buckets.sort(Comparator
                .comparingLong(EsFacetBucket::count).reversed()
                .thenComparingLong(EsFacetBucket::id));
        return buckets;
    }

    private EsSearchPageResult executePage(NativeQuery nativeQuery) {
        try {
            SearchHits<BrandObjectDocument> hits =
                    elasticsearchOperations.search(nativeQuery, BrandObjectDocument.class);
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
