package com.zjusthow.minicollections.elasticsearch;

import org.junit.jupiter.api.Test;
import org.opensearch.data.client.orhlc.OpenSearchAggregations;
import org.opensearch.index.query.MultiMatchQueryBuilder;
import org.opensearch.search.aggregations.Aggregations;
import org.opensearch.search.aggregations.bucket.terms.Terms;
import org.springframework.data.elasticsearch.core.SearchHits;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SearchQuerySupportOpenSearchTest {

    @Test
    void multiMatchOpenSearch_parsesFieldBoostSyntax() {
        SearchQuerySupport support = new SearchQuerySupport(true);

        Object query = support.multiMatchWithCompactFallback(
                "autoart",
                List.of("brand_name_en^3", "name_en^2", "scale"));

        MultiMatchQueryBuilder multiMatch = (MultiMatchQueryBuilder) query;
        Map<String, Float> fields = multiMatch.fields();
        assertEquals(3.0f, fields.get("brand_name_en"), 0.001f);
        assertEquals(2.0f, fields.get("name_en"), 0.001f);
        assertEquals(1.0f, fields.get("scale"), 0.001f);
    }

    @Test
    void appendOpenSearchField_doesNotPassCaretSyntaxAsFieldName() {
        MultiMatchQueryBuilder builder = org.opensearch.index.query.QueryBuilders.multiMatchQuery("autoart");
        SearchQuerySupport.appendOpenSearchField(builder, "brand_abbreviation^3");

        assertTrue(builder.fields().containsKey("brand_abbreviation"));
        assertEquals(3.0f, builder.fields().get("brand_abbreviation"), 0.001f);
    }

    @Test
    void parseTermBuckets_readsTermsFromOpenSearchClientResponse() {
        SearchQuerySupport support = new SearchQuerySupport(true);

        Terms.Bucket bucket3 = mock(Terms.Bucket.class);
        when(bucket3.getKeyAsNumber()).thenReturn(3L);
        when(bucket3.getDocCount()).thenReturn(12L);

        Terms.Bucket bucket0 = mock(Terms.Bucket.class);
        when(bucket0.getKeyAsNumber()).thenReturn(0L);
        when(bucket0.getDocCount()).thenReturn(5L);

        Terms.Bucket bucket7 = mock(Terms.Bucket.class);
        when(bucket7.getKeyAsNumber()).thenReturn(7L);
        when(bucket7.getDocCount()).thenReturn(2L);

        Terms terms = mock(Terms.class);
        when(terms.getName()).thenReturn("facet");
        doReturn(List.of(bucket3, bucket0, bucket7)).when(terms).getBuckets();

        Aggregations aggregations = new Aggregations(List.of(terms));
        @SuppressWarnings("unchecked")
        SearchHits<Object> hits = mock(SearchHits.class);
        doReturn(new OpenSearchAggregations(aggregations)).when(hits).getAggregations();

        List<EsFacetBucket> buckets = support.parseTermBuckets(hits, "facet");

        assertEquals(2, buckets.size());
        assertEquals(3L, buckets.get(0).id());
        assertEquals(12L, buckets.get(0).count());
        assertEquals(7L, buckets.get(1).id());
        assertEquals(2L, buckets.get(1).count());
    }
}
