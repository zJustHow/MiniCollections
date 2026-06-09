package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;

import java.util.List;

final class ElasticsearchSearchQueries {

    private ElasticsearchSearchQueries() {
    }

    static Query multiMatchWithCompactFallback(String keyword, List<String> fields) {
        String trimmed = keyword.trim();
        Query primary = multiMatch(trimmed, fields);
        if (!SearchKeywordNormalizer.hasSeparators(trimmed)) {
            return primary;
        }
        String compact = SearchKeywordNormalizer.compact(trimmed);
        if (compact.isEmpty() || compact.equals(trimmed)) {
            return primary;
        }
        return Query.of(q -> q.bool(b -> b
                .should(primary)
                .should(multiMatch(compact, fields))
                .minimumShouldMatch("1")));
    }

    private static Query multiMatch(String query, List<String> fields) {
        return Query.of(sq -> sq.multiMatch(m -> m
                .query(query)
                .fields(fields)
                .type(TextQueryType.BestFields)
                .operator(Operator.Or)));
    }
}
