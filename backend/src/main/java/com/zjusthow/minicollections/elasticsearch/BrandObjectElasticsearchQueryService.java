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
import org.springframework.data.domain.PageRequest;
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
    private static final String CATEGORY_AGG = "by_category";
    private static final String BRAND_AGG = "by_brand";
    private static final String SCALE_AGG = "by_scale";
    private static final int MAX_CATEGORY_BUCKETS = 32;
    private static final int MAX_BRAND_BUCKETS = 48;
    private static final int MAX_SCALE_BUCKETS = 32;

    private final ElasticsearchOperations elasticsearchOperations;

    public BrandObjectElasticsearchQueryService(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

    public EsSearchPageResult searchPage(
            String keyword,
            BrandObjectSearchFilter filter,
            int page,
            int size) {
        return searchPageInternal(keyword, filter, page, size);
    }

    public EsSearchFacetsResult searchFacets(String keyword, Long scopeBrandId) {
        if (keyword == null || keyword.isBlank()) {
            return new EsSearchFacetsResult(0L, List.of(), List.of(), List.of());
        }
        String q = keyword.trim();
        BrandObjectSearchFilter facetFilter = scopeBrandId == null
                ? BrandObjectSearchFilter.global(null, null, null)
                : BrandObjectSearchFilter.withinBrand(scopeBrandId, null, null);

        var builder = NativeQuery.builder()
                .withQuery(buildSearchQuery(q, facetFilter))
                .withMaxResults(0)
                .withTrackTotalHitsUpTo(10_000)
                .withAggregation(CATEGORY_AGG, termsAgg("category_id", MAX_CATEGORY_BUCKETS))
                .withAggregation(BRAND_AGG, termsAgg("brand_id", MAX_BRAND_BUCKETS))
                .withAggregation(SCALE_AGG, termsAgg("scale_id", MAX_SCALE_BUCKETS));

        try {
            SearchHits<BrandObjectDocument> hits =
                    elasticsearchOperations.search(builder.build(), BrandObjectDocument.class);
            long total = hits.getTotalHits() >= 0 ? hits.getTotalHits() : 0L;
            return new EsSearchFacetsResult(
                    total,
                    parseTermBuckets(hits, CATEGORY_AGG),
                    scopeBrandId == null ? parseTermBuckets(hits, BRAND_AGG) : List.of(),
                    parseTermBuckets(hits, SCALE_AGG));
        } catch (Exception e) {
            log.warn("Elasticsearch search facets failed: {}", e.getMessage());
            throw e;
        }
    }

    /** @deprecated use {@link #searchFacets(String, Long)} */
    public EsCategoryFacetsResult categoryFacets(String keyword, Long brandId) {
        EsSearchFacetsResult result = searchFacets(keyword, brandId);
        List<EsCategoryFacetBucket> categories = result.categories().stream()
                .map(b -> new EsCategoryFacetBucket(b.id(), b.count()))
                .toList();
        return new EsCategoryFacetsResult(result.total(), categories);
    }

    private Aggregation termsAgg(String field, int size) {
        return Aggregation.of(a -> a.terms(t -> t.field(field).size(size)));
    }

    private EsSearchPageResult searchPageInternal(
            String keyword,
            BrandObjectSearchFilter filter,
            int page,
            int size) {
        if (keyword == null || keyword.isBlank()) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        String q = keyword.trim();
        int safePage = Math.max(page, 0);
        var nativeQuery = NativeQuery.builder()
                .withQuery(buildSearchQuery(q, filter))
                .withSort(s -> s.score(sc -> sc.order(SortOrder.Desc)))
                .withSort(s -> s.field(f -> f.field("id").order(SortOrder.Asc)))
                .withPageable(PageRequest.of(safePage, size))
                .withTrackTotalHitsUpTo(10_000)
                .build();
        return executePage(nativeQuery);
    }

    private Query buildSearchQuery(String q, BrandObjectSearchFilter filter) {
        if (!filter.hasActiveFilters()) {
            return Query.of(sq -> sq.multiMatch(m -> m
                    .query(q)
                    .fields("brand_name_en^3", "brand_name_zh^3", "name_en^2", "name_zh^2",
                            "series_en", "series_zh", "category_en", "category_zh", "scale")
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
                        .fields("brand_name_en^3", "brand_name_zh^3", "name_en^2", "name_zh^2",
                                "series_en", "series_zh", "category_en", "category_zh", "scale")
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
