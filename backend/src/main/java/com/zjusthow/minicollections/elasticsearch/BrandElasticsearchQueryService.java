package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
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

    public EsSearchPageResult searchPage(String keyword, int page, int size) {
        if (keyword == null || keyword.isBlank()) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        String q = keyword.trim();
        int safePage = Math.max(page, 0);
        var nativeQuery = NativeQuery.builder()
                .withQuery(sq -> sq.multiMatch(m -> m
                        .query(q)
                        .fields("name_en^2", "name_zh^2")
                        .type(TextQueryType.BestFields)
                        .operator(Operator.Or)))
                .withSort(s -> s.score(sc -> sc.order(SortOrder.Desc)))
                .withSort(s -> s.field(f -> f.field("id").order(SortOrder.Asc)))
                .withPageable(PageRequest.of(safePage, size))
                .withTrackTotalHitsUpTo(10_000)
                .build();
        return executePage(nativeQuery);
    }

    public EsSearchPageResult searchSlice(String keyword, int offset, int size) {
        if (keyword == null || keyword.isBlank() || size <= 0) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        int safeOffset = Math.max(offset, 0);
        int fetchSize = Math.min(safeOffset + size, 10_000);
        EsSearchPageResult pageResult = searchPage(keyword, 0, fetchSize);
        List<Long> ids = pageResult.ids();
        if (safeOffset >= ids.size()) {
            return new EsSearchPageResult(List.of(), pageResult.totalElements(), pageResult.totalExact());
        }
        int end = Math.min(safeOffset + size, ids.size());
        return new EsSearchPageResult(
                ids.subList(safeOffset, end),
                pageResult.totalElements(),
                pageResult.totalExact());
    }

    private EsSearchPageResult executePage(NativeQuery nativeQuery) {
        try {
            SearchHits<BrandDocument> hits = elasticsearchOperations.search(nativeQuery, BrandDocument.class);
            List<Long> ids = new ArrayList<>();
            for (SearchHit<BrandDocument> hit : hits) {
                if (hit.getContent() != null && hit.getContent().id() != null) {
                    ids.add(hit.getContent().id());
                }
            }
            long totalElements = hits.getTotalHits() >= 0 ? hits.getTotalHits() : ids.size();
            boolean totalExact = hits.getTotalHitsRelation().name().equals("EQUAL_TO");
            return new EsSearchPageResult(ids, totalElements, totalExact);
        } catch (Exception e) {
            log.warn("Elasticsearch brand query failed: {}", e.getMessage());
            throw e;
        }
    }
}
