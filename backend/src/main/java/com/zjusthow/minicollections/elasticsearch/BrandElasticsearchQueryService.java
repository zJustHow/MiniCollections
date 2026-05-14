package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BrandElasticsearchQueryService {

    private static final Logger log = LoggerFactory.getLogger(BrandElasticsearchQueryService.class);

    private final ElasticsearchOperations elasticsearchOperations;

    public BrandElasticsearchQueryService(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

    public List<Long> searchIdsByKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        String q = keyword.trim();
        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(sq -> sq.multiMatch(m -> m
                        .query(q)
                        .fields("name_en^2", "name_zh^2")
                        .type(TextQueryType.BestFields)
                        .operator(Operator.Or)))
                .withMaxResults(1000)
                .build();
        try {
            SearchHits<BrandDocument> hits = elasticsearchOperations.search(nativeQuery, BrandDocument.class);
            List<Long> ids = new ArrayList<>();
            for (SearchHit<BrandDocument> hit : hits) {
                if (hit.getContent() != null && hit.getContent().id() != null) {
                    ids.add(hit.getContent().id());
                }
            }
            return ids;
        } catch (Exception e) {
            log.warn("Elasticsearch brand query failed: {}", e.getMessage());
            throw e;
        }
    }
}
