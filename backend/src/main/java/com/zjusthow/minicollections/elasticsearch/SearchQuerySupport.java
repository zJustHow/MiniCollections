package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregation;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.zjusthow.minicollections.model.BrandObjectSearchFilter;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.AggregationsContainer;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Builds Elasticsearch (elc) search queries for brand and brand-object indexes. */
@Component
public class SearchQuerySupport {

    org.springframework.data.elasticsearch.core.query.Query countQuery(Query query, int maxResultWindow) {
        return NativeQuery.builder()
                .withQuery(query)
                .withMaxResults(0)
                .withTrackTotalHitsUpTo(maxResultWindow)
                .build();
    }

    org.springframework.data.elasticsearch.core.query.Query pageQuery(
            Query query,
            int offset,
            int size,
            int maxResultWindow) {
        return NativeQuery.builder()
                .withQuery(query)
                .withSort(s -> s.score(sc -> sc.order(SortOrder.Desc)))
                .withSort(s -> s.field(f -> f.field("id").order(SortOrder.Asc)))
                .withPageable(new OffsetPageRequest(offset, size))
                .withTrackTotalHitsUpTo(maxResultWindow)
                .build();
    }

    org.springframework.data.elasticsearch.core.query.Query facetQuery(
            Query query,
            String aggName,
            String field,
            int maxBuckets,
            int maxResultWindow) {
        return NativeQuery.builder()
                .withQuery(query)
                .withMaxResults(0)
                .withAggregation(aggName, Aggregation.of(a -> a.terms(t -> t.field(field).size(maxBuckets))))
                .withTrackTotalHitsUpTo(maxResultWindow)
                .build();
    }

    Query boolMustWithFilters(String keyword, List<String> mustFields, BrandObjectSearchFilter filter) {
        return Query.of(sq -> sq.bool(b -> {
            b.must(ElasticsearchSearchQueries.multiMatchWithCompactFallback(keyword, mustFields));
            if (filter.scopeBrandId() != null) {
                b.filter(f -> f.term(t -> t.field("brand_id").value(filter.scopeBrandId())));
            } else if (filter.filterBrands()) {
                b.filter(f -> f.terms(t -> t
                        .field("brand_id")
                        .terms(tv -> tv.value(toFieldValues(filter.brandIds())))));
            }
            appendFilters(b, filter);
            return b;
        }));
    }

    List<EsFacetBucket> parseTermBuckets(SearchHits<?> hits, String aggName) {
        if (hits.getAggregations() == null) {
            return List.of();
        }
        return parseTermBuckets(hits.getAggregations(), aggName);
    }

    private void appendFilters(
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

    private List<FieldValue> toFieldValues(List<Long> ids) {
        return ids.stream().map(FieldValue::of).toList();
    }

    private List<EsFacetBucket> parseTermBuckets(AggregationsContainer<?> container, String aggName) {
        if (!(container instanceof ElasticsearchAggregations esAggs)) {
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
