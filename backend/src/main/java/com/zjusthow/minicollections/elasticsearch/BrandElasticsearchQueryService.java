package com.zjusthow.minicollections.elasticsearch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private final SearchQuerySupport searchQuerySupport;

    public BrandElasticsearchQueryService(
            ElasticsearchOperations elasticsearchOperations,
            SearchQuerySupport searchQuerySupport) {
        this.elasticsearchOperations = elasticsearchOperations;
        this.searchQuerySupport = searchQuerySupport;
    }

    private static final int MAX_RESULT_WINDOW = 10_000;

    public EsSearchPageResult searchPage(String keyword, int page, int size) {
        if (keyword == null || keyword.isBlank() || size <= 0) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        int safePage = Math.max(page, 0);
        return searchAtOffset(keyword, (long) safePage * size, size);
    }

    public EsSearchPageResult searchCount(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return new EsSearchPageResult(List.of(), 0L, true);
        }
        return countOnly(keyword.trim());
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
        var query = searchQuerySupport.pageQuery(buildSearchQuery(q), safeOffset, safeSize, MAX_RESULT_WINDOW);
        return executePage(query);
    }

    private static final List<String> BRAND_SEARCH_FIELDS = List.of(
            "name_en^2", "name_zh^2", "abbreviation^3");

    private Object buildSearchQuery(String q) {
        return searchQuerySupport.multiMatchWithCompactFallback(q, BRAND_SEARCH_FIELDS);
    }

    private EsSearchPageResult countOnly(String q) {
        var query = searchQuerySupport.countQuery(buildSearchQuery(q), MAX_RESULT_WINDOW);
        return executePage(query);
    }

    private EsSearchPageResult executePage(org.springframework.data.elasticsearch.core.query.Query query) {
        try {
            SearchHits<BrandDocument> hits = elasticsearchOperations.search(query, BrandDocument.class);
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
