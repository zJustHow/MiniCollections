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
public class BrandObjectElasticsearchQueryService {

    private static final Logger log = LoggerFactory.getLogger(BrandObjectElasticsearchQueryService.class);

    private final ElasticsearchOperations elasticsearchOperations;

    public BrandObjectElasticsearchQueryService(ElasticsearchOperations elasticsearchOperations) {
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
                        .fields("name_en^2", "name_zh^2", "category_en", "category_zh", "scale")
                        .type(TextQueryType.BestFields)
                        .operator(Operator.Or)))
                .build();
        try {
            SearchHits<BrandObjectDocument> hits = elasticsearchOperations.search(nativeQuery, BrandObjectDocument.class);
            List<Long> ids = new ArrayList<>();
            for (SearchHit<BrandObjectDocument> hit : hits) {
                if (hit.getContent() != null && hit.getContent().id() != null) {
                    ids.add(hit.getContent().id());
                }
            }
            return ids;
        } catch (Exception e) {
            log.warn("Elasticsearch query failed: {}", e.getMessage());
            throw e;
        }
    }
}
