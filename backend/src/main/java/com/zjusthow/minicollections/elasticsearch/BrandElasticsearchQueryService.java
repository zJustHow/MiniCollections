package com.zjusthow.minicollections.elasticsearch;

import co.elastic.clients.elasticsearch._types.SortOrder;
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

    public EsSearchSliceResult searchSlice(String keyword, List<Object> searchAfter, int size, boolean countTotal) {
        if (keyword == null || keyword.isBlank()) {
            return new EsSearchSliceResult(List.of(), null, 0L, true, false);
        }
        String q = keyword.trim();
        var builder = NativeQuery.builder()
                .withQuery(sq -> sq.multiMatch(m -> m
                        .query(q)
                        .fields("name_en^2", "name_zh^2")
                        .type(TextQueryType.BestFields)
                        .operator(Operator.Or)))
                .withSort(s -> s.score(sc -> sc.order(SortOrder.Desc)))
                .withSort(s -> s.field(f -> f.field("id").order(SortOrder.Asc)))
                .withMaxResults(size);
        if (searchAfter != null && !searchAfter.isEmpty()) {
            builder.withSearchAfter(searchAfter);
        }
        if (countTotal) {
            builder.withTrackTotalHitsUpTo(10_000);
        } else {
            builder.withTrackTotalHitsUpTo(0);
        }
        return executeSlice(builder.build(), size, countTotal);
    }

    private EsSearchSliceResult executeSlice(NativeQuery nativeQuery, int size, boolean countTotal) {
        try {
            SearchHits<BrandDocument> hits = elasticsearchOperations.search(nativeQuery, BrandDocument.class);
            List<Long> ids = new ArrayList<>();
            List<Object> lastSort = null;
            for (SearchHit<BrandDocument> hit : hits) {
                if (hit.getContent() != null && hit.getContent().id() != null) {
                    ids.add(hit.getContent().id());
                    lastSort = hit.getSortValues();
                }
            }
            boolean hasMore = ids.size() == size;
            List<Object> nextSort = hasMore ? lastSort : null;
            Long totalElements = null;
            boolean totalExact = true;
            if (countTotal && hits.getTotalHits() >= 0) {
                totalElements = hits.getTotalHits();
                totalExact = hits.getTotalHitsRelation().name().equals("EQUAL_TO");
            }
            return new EsSearchSliceResult(ids, nextSort, totalElements, totalExact, hasMore);
        } catch (Exception e) {
            log.warn("Elasticsearch brand query failed: {}", e.getMessage());
            throw e;
        }
    }
}
