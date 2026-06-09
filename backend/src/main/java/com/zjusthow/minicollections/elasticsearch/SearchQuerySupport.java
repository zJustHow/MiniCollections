package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregation;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.zjusthow.minicollections.model.BrandObjectSearchFilter;
import org.opensearch.data.client.orhlc.NativeSearchQueryBuilder;
import org.opensearch.index.query.BoolQueryBuilder;
import org.opensearch.index.query.MultiMatchQueryBuilder;
import org.opensearch.index.query.Operator;
import org.opensearch.index.query.QueryBuilder;
import org.opensearch.index.query.QueryBuilders;
import org.opensearch.search.aggregations.AggregationBuilders;
import org.opensearch.search.aggregations.bucket.terms.LongTerms;
import org.opensearch.search.aggregations.bucket.terms.Terms;
import org.opensearch.search.sort.SortBuilders;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.AggregationsContainer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Builds search queries compatible with both local Elasticsearch (elc) and production OpenSearch (orhlc).
 */
@Component
public class SearchQuerySupport {

    private final boolean openSearchBackend;

    @Autowired
    public SearchQuerySupport(ElasticsearchOperations elasticsearchOperations) {
        this(isOpenSearchBackend(elasticsearchOperations));
    }

    SearchQuerySupport(boolean openSearchBackend) {
        this.openSearchBackend = openSearchBackend;
    }

    private static boolean isOpenSearchBackend(ElasticsearchOperations elasticsearchOperations) {
        return elasticsearchOperations.getClass().getName().toLowerCase().contains("opensearch");
    }

    boolean usesOpenSearch() {
        return openSearchBackend;
    }

    org.springframework.data.elasticsearch.core.query.Query countQuery(Object query, int maxResultWindow) {
        if (openSearchBackend) {
            return new NativeSearchQueryBuilder()
                    .withQuery((QueryBuilder) query)
                    .withMaxResults(0)
                    .withTrackTotalHitsUpTo(maxResultWindow)
                    .build();
        }
        return NativeQuery.builder()
                .withQuery((Query) query)
                .withMaxResults(0)
                .withTrackTotalHitsUpTo(maxResultWindow)
                .build();
    }

    org.springframework.data.elasticsearch.core.query.Query pageQuery(
            Object query,
            int offset,
            int size,
            int maxResultWindow) {
        if (openSearchBackend) {
            return new NativeSearchQueryBuilder()
                    .withQuery((QueryBuilder) query)
                    .withSorts(
                            SortBuilders.scoreSort().order(org.opensearch.search.sort.SortOrder.DESC),
                            SortBuilders.fieldSort("id").order(org.opensearch.search.sort.SortOrder.ASC))
                    .withPageable(new OffsetPageRequest(offset, size))
                    .withTrackTotalHitsUpTo(maxResultWindow)
                    .build();
        }
        return NativeQuery.builder()
                .withQuery((Query) query)
                .withSort(s -> s.score(sc -> sc.order(SortOrder.Desc)))
                .withSort(s -> s.field(f -> f.field("id").order(SortOrder.Asc)))
                .withPageable(new OffsetPageRequest(offset, size))
                .withTrackTotalHitsUpTo(maxResultWindow)
                .build();
    }

    org.springframework.data.elasticsearch.core.query.Query facetQuery(
            Object query,
            String aggName,
            String field,
            int maxBuckets,
            int maxResultWindow) {
        if (openSearchBackend) {
            return new NativeSearchQueryBuilder()
                    .withQuery((QueryBuilder) query)
                    .withMaxResults(0)
                    .withAggregations(AggregationBuilders.terms(aggName).field(field).size(maxBuckets))
                    .withTrackTotalHitsUpTo(maxResultWindow)
                    .build();
        }
        return NativeQuery.builder()
                .withQuery((Query) query)
                .withMaxResults(0)
                .withAggregation(aggName, Aggregation.of(a -> a.terms(t -> t.field(field).size(maxBuckets))))
                .withTrackTotalHitsUpTo(maxResultWindow)
                .build();
    }

    Object multiMatchWithCompactFallback(String keyword, List<String> fields) {
        if (openSearchBackend) {
            return multiMatchOpenSearch(keyword, fields);
        }
        return ElasticsearchSearchQueries.multiMatchWithCompactFallback(keyword, fields);
    }

    Object boolMustWithBrandObjectFilters(
            String keyword,
            List<String> mustFields,
            BrandObjectSearchFilter filter) {
        if (openSearchBackend) {
            return boolMustWithBrandObjectFiltersOpenSearch(keyword, mustFields, filter);
        }
        return boolMustWithBrandObjectFiltersElasticsearch(keyword, mustFields, filter);
    }

    Object boolMustWithFilters(
            String keyword,
            List<String> mustFields,
            BrandObjectSearchFilter filter) {
        if (openSearchBackend) {
            return boolMustWithFiltersOpenSearch(keyword, mustFields, filter);
        }
        return boolMustWithFiltersElasticsearch(keyword, mustFields, filter);
    }

    List<EsFacetBucket> parseTermBuckets(SearchHits<?> hits, String aggName) {
        if (hits.getAggregations() == null) {
            return List.of();
        }
        AggregationsContainer<?> container = hits.getAggregations();
        if (openSearchBackend) {
            return parseOpenSearchTermBuckets(container, aggName);
        }
        return parseElasticsearchTermBuckets(container, aggName);
    }

    private Query boolMustWithBrandObjectFiltersElasticsearch(
            String keyword,
            List<String> mustFields,
            BrandObjectSearchFilter filter) {
        return Query.of(sq -> sq.bool(b -> {
            if (filter.scopeBrandId() != null) {
                b.must(ElasticsearchSearchQueries.multiMatchWithCompactFallback(keyword, mustFields));
                b.filter(f -> f.term(t -> t.field("brand_id").value(filter.scopeBrandId())));
            } else {
                b.must(ElasticsearchSearchQueries.multiMatchWithCompactFallback(keyword, mustFields));
                if (filter.filterBrands()) {
                    b.filter(f -> f.terms(t -> t
                            .field("brand_id")
                            .terms(tv -> tv.value(toFieldValues(filter.brandIds())))));
                }
            }
            appendElasticsearchFilters(b, filter);
            return b;
        }));
    }

    private Query boolMustWithFiltersElasticsearch(
            String keyword,
            List<String> mustFields,
            BrandObjectSearchFilter filter) {
        return Query.of(sq -> sq.bool(b -> {
            if (filter.scopeBrandId() != null) {
                b.must(ElasticsearchSearchQueries.multiMatchWithCompactFallback(keyword, mustFields));
                b.filter(f -> f.term(t -> t.field("brand_id").value(filter.scopeBrandId())));
            } else {
                b.must(ElasticsearchSearchQueries.multiMatchWithCompactFallback(keyword, mustFields));
                if (filter.filterBrands()) {
                    b.filter(f -> f.terms(t -> t
                            .field("brand_id")
                            .terms(tv -> tv.value(toFieldValues(filter.brandIds())))));
                }
            }
            appendElasticsearchFilters(b, filter);
            return b;
        }));
    }

    private void appendElasticsearchFilters(
            co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery.Builder builder,
            BrandObjectSearchFilter filter) {
        if (filter.filterCategories()) {
            builder.filter(f -> f.terms(t -> t
                    .field("category_id")
                    .terms(tv -> tv.value(toFieldValues(filter.categoryIds())))));
        }
        if (filter.filterScales()) {
            builder.filter(f -> f.terms(t -> t
                    .field("scale_id")
                    .terms(tv -> tv.value(toFieldValues(filter.scaleIds())))));
        }
        if (filter.filterSeries()) {
            builder.filter(f -> f.terms(t -> t
                    .field("series_id")
                    .terms(tv -> tv.value(toFieldValues(filter.seriesIds())))));
        }
    }

    private QueryBuilder boolMustWithBrandObjectFiltersOpenSearch(
            String keyword,
            List<String> mustFields,
            BrandObjectSearchFilter filter) {
        BoolQueryBuilder bool = QueryBuilders.boolQuery();
        bool.must(multiMatchOpenSearch(keyword, mustFields));
        if (filter.scopeBrandId() != null) {
            bool.filter(QueryBuilders.termQuery("brand_id", filter.scopeBrandId()));
        } else if (filter.filterBrands()) {
            bool.filter(QueryBuilders.termsQuery("brand_id", filter.brandIds()));
        }
        if (filter.filterCategories()) {
            bool.filter(QueryBuilders.termsQuery("category_id", filter.categoryIds()));
        }
        if (filter.filterScales()) {
            bool.filter(QueryBuilders.termsQuery("scale_id", filter.scaleIds()));
        }
        if (filter.filterSeries()) {
            bool.filter(QueryBuilders.termsQuery("series_id", filter.seriesIds()));
        }
        return bool;
    }

    private QueryBuilder boolMustWithFiltersOpenSearch(
            String keyword,
            List<String> mustFields,
            BrandObjectSearchFilter filter) {
        BoolQueryBuilder bool = QueryBuilders.boolQuery();
        bool.must(multiMatchOpenSearch(keyword, mustFields));
        if (filter.scopeBrandId() != null) {
            bool.filter(QueryBuilders.termQuery("brand_id", filter.scopeBrandId()));
        } else if (filter.filterBrands()) {
            bool.filter(QueryBuilders.termsQuery("brand_id", filter.brandIds()));
        }
        if (filter.filterCategories()) {
            bool.filter(QueryBuilders.termsQuery("category_id", filter.categoryIds()));
        }
        if (filter.filterScales()) {
            bool.filter(QueryBuilders.termsQuery("scale_id", filter.scaleIds()));
        }
        if (filter.filterSeries()) {
            bool.filter(QueryBuilders.termsQuery("series_id", filter.seriesIds()));
        }
        return bool;
    }

    private QueryBuilder multiMatchOpenSearch(String keyword, List<String> fields) {
        String trimmed = keyword.trim();
        QueryBuilder primary = multiMatchBuilder(trimmed, fields);
        if (!SearchKeywordNormalizer.hasSeparators(trimmed)) {
            return primary;
        }
        String compact = SearchKeywordNormalizer.compact(trimmed);
        if (compact.isEmpty() || compact.equals(trimmed)) {
            return primary;
        }
        return QueryBuilders.boolQuery()
                .should(primary)
                .should(multiMatchBuilder(compact, fields))
                .minimumShouldMatch(1);
    }

    private QueryBuilder multiMatchBuilder(String query, List<String> fields) {
        MultiMatchQueryBuilder builder = QueryBuilders.multiMatchQuery(query)
                .type(MultiMatchQueryBuilder.Type.BEST_FIELDS)
                .operator(Operator.OR);
        for (String fieldSpec : fields) {
            appendOpenSearchField(builder, fieldSpec);
        }
        return builder;
    }

    static void appendOpenSearchField(MultiMatchQueryBuilder builder, String fieldSpec) {
        int caret = fieldSpec.lastIndexOf('^');
        if (caret > 0 && caret < fieldSpec.length() - 1) {
            String fieldName = fieldSpec.substring(0, caret);
            String boostText = fieldSpec.substring(caret + 1);
            try {
                builder.field(fieldName, Float.parseFloat(boostText));
                return;
            } catch (NumberFormatException ignored) {
                // Fall through to unboosted field when boost is malformed.
            }
        }
        builder.field(fieldSpec);
    }

    private List<FieldValue> toFieldValues(List<Long> ids) {
        return ids.stream().map(FieldValue::of).toList();
    }

    @SuppressWarnings("unchecked")
    private List<EsFacetBucket> parseOpenSearchTermBuckets(AggregationsContainer<?> container, String aggName) {
        Object aggregations = container.aggregations();
        if (!(aggregations instanceof org.opensearch.search.aggregations.Aggregations osAggs)) {
            return List.of();
        }
        Terms terms = osAggs.get(aggName);
        if (!(terms instanceof LongTerms longTerms)) {
            return List.of();
        }
        List<EsFacetBucket> buckets = new ArrayList<>();
        for (Terms.Bucket bucket : longTerms.getBuckets()) {
            long key = bucket.getKeyAsNumber().longValue();
            if (key != 0L) {
                buckets.add(new EsFacetBucket(key, bucket.getDocCount()));
            }
        }
        buckets.sort(Comparator
                .comparingLong(EsFacetBucket::count).reversed()
                .thenComparingLong(EsFacetBucket::id));
        return buckets;
    }

    private List<EsFacetBucket> parseElasticsearchTermBuckets(AggregationsContainer<?> container, String aggName) {
        if (!(container instanceof org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations esAggs)) {
            return List.of();
        }
        org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation aggregation = esAggs.get(aggName);
        if (aggregation == null) {
            return List.of();
        }
        var aggregate = aggregation.aggregation().getAggregate();
        if (!aggregate.isLterms()) {
            return List.of();
        }
        var terms = aggregate.lterms();
        List<EsFacetBucket> buckets = new ArrayList<>();
        for (var bucket : terms.buckets().array()) {
            if (bucket.key() != 0L) {
                buckets.add(new EsFacetBucket(bucket.key(), bucket.docCount()));
            }
        }
        buckets.sort(Comparator
                .comparingLong(EsFacetBucket::count).reversed()
                .thenComparingLong(EsFacetBucket::id));
        return buckets;
    }
}
