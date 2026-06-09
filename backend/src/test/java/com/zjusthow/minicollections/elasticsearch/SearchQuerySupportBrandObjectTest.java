package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import org.junit.jupiter.api.Test;
import org.opensearch.index.query.BoolQueryBuilder;
import org.opensearch.index.query.QueryBuilder;
import org.opensearch.index.query.TermQueryBuilder;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchQuerySupportBrandObjectTest {

    @Test
    void brandObjectTextQuery_elasticsearch_includesCompactBrandTerm() {
        SearchQuerySupport support = new SearchQuerySupport(false);

        Object query = support.brandObjectTextQuery(
                "autoart",
                BrandObjectElasticsearchQueryServiceTestFields.GLOBAL);

        assertInstanceOf(Query.class, query);
        String json = query.toString();
        assertTrue(json.contains("brand_name_compact"));
        assertTrue(json.contains("autoart"));
    }

    @Test
    void brandObjectTextQuery_openSearch_includesCompactBrandTerm() {
        SearchQuerySupport support = new SearchQuerySupport(true);

        Object query = support.brandObjectTextQuery(
                "auto art",
                BrandObjectElasticsearchQueryServiceTestFields.GLOBAL);

        assertInstanceOf(BoolQueryBuilder.class, query);
        BoolQueryBuilder bool = (BoolQueryBuilder) query;
        assertTrue(bool.should().stream().anyMatch(SearchQuerySupportBrandObjectTest::isCompactBrandTerm));
    }

    private static boolean isCompactBrandTerm(QueryBuilder clause) {
        return clause instanceof TermQueryBuilder term
                && "brand_name_compact".equals(term.fieldName())
                && "autoart".equals(term.value());
    }
}

/** Package-visible field list for query tests. */
final class BrandObjectElasticsearchQueryServiceTestFields {
    static final java.util.List<String> GLOBAL = java.util.List.of(
            "brand_name_en^3",
            "brand_abbreviation^3",
            "brand_name_zh^3",
            "name_en^2",
            "name_zh^2");

    private BrandObjectElasticsearchQueryServiceTestFields() {
    }
}
