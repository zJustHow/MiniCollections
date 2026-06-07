package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
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

    private static final int MAX_RESULT_WINDOW = 10_000;

    public EsSearchPageResult searchPage(String keyword, int page, int size) {
        if (keyword == null || keyword.isBlank() || size <= 0) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        int safePage = Math.max(page, 0);
        return searchAtOffset(keyword, (long) safePage * size, size);
    }

    public EsSearchPageResult searchSlice(String keyword, int offset, int size) {
        if (keyword == null || keyword.isBlank() || size <= 0) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        return searchAtOffset(keyword, Math.max(offset, 0), size);
    }

    private EsSearchPageResult searchAtOffset(String keyword, long offset, int size) {
        String q = keyword.trim();
        int safeOffset = (int) Math.min(Math.max(offset, 0L), MAX_RESULT_WINDOW);
        int safeSize = Math.min(size, MAX_RESULT_WINDOW - safeOffset);
        if (safeSize <= 0) {
            return countOnly(q);
        }
        var nativeQuery = NativeQuery.builder()
                .withQuery(buildSearchQuery(q))
                .withSort(s -> s.score(sc -> sc.order(SortOrder.Desc)))
                .withSort(s -> s.field(f -> f.field("id").order(SortOrder.Asc)))
                .withPageable(new OffsetPageRequest(safeOffset, safeSize))
                .withTrackTotalHitsUpTo(MAX_RESULT_WINDOW)
                .build();
        return executePage(nativeQuery);
    }

    private Query buildSearchQuery(String q) {
        return Query.of(sq -> sq.multiMatch(m -> m
                .query(q)
                .fields("name_en^2", "name_zh^2", "abbreviation^3")
                .type(TextQueryType.BestFields)
                .operator(Operator.Or)));
    }

    private EsSearchPageResult countOnly(String q) {
        var nativeQuery = NativeQuery.builder()
                .withQuery(buildSearchQuery(q))
                .withMaxResults(0)
                .withTrackTotalHitsUpTo(MAX_RESULT_WINDOW)
                .build();
        return executePage(nativeQuery);
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
