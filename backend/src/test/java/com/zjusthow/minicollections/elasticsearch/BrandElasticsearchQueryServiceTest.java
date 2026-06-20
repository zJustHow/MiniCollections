package com.zjusthow.minicollections.elasticsearch;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.TotalHitsRelation;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BrandElasticsearchQueryServiceTest {

    @Mock ElasticsearchOperations elasticsearchOperations;

    private BrandElasticsearchQueryService queryService;

    @BeforeEach
    void setUp() {
        queryService = new BrandElasticsearchQueryService(
                elasticsearchOperations,
                new SearchQuerySupport());
    }

    @Test
    void searchPage_blankKeywordSkipsElasticsearch() {
        EsSearchPageResult result = queryService.searchPage("  ", 0, 24);

        assertEquals(0L, result.totalElements());
        assertTrue(result.ids().isEmpty());
        verifyNoInteractions(elasticsearchOperations);
    }

    @Test
    void searchCount_blankKeywordReturnsEmpty() {
        EsSearchPageResult result = queryService.searchCount(null);

        assertEquals(0L, result.totalElements());
        verifyNoInteractions(elasticsearchOperations);
    }

    @Test
    void searchSlice_nonPositiveSizeSkipsElasticsearch() {
        EsSearchPageResult result = queryService.searchSlice("bmw", 0, 0);

        assertTrue(result.ids().isEmpty());
        verifyNoInteractions(elasticsearchOperations);
    }

    @Test
    void searchPage_mapsElasticsearchHitsToIds() {
        BrandDocument document = new BrandDocument(1L, "Kyosho", "k", "京商", 0L);
        SearchHit<BrandDocument> hit = org.mockito.Mockito.mock(SearchHit.class);
        when(hit.getContent()).thenReturn(document);
        List<SearchHit<BrandDocument>> hitsList = List.of(hit);

        @SuppressWarnings("unchecked")
        SearchHits<BrandDocument> hits = org.mockito.Mockito.mock(SearchHits.class);
        when(hits.iterator()).thenReturn(hitsList.iterator());
        when(hits.getTotalHits()).thenReturn(1L);
        when(hits.getTotalHitsRelation()).thenReturn(TotalHitsRelation.EQUAL_TO);
        when(elasticsearchOperations.search(any(Query.class), eq(BrandDocument.class))).thenReturn(hits);

        EsSearchPageResult result = queryService.searchPage("kyosho", 0, 24);

        assertEquals(List.of(1L), result.ids());
        assertEquals(1L, result.totalElements());
        assertTrue(result.totalExact());
    }
}
