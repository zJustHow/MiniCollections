package com.zjusthow.minicollections.elasticsearch;

import org.junit.jupiter.api.Test;
import org.opensearch.index.query.MultiMatchQueryBuilder;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
}
