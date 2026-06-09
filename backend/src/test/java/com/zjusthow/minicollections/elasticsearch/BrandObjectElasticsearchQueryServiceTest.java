package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.model.BrandObjectSearchFilter;
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
class BrandObjectElasticsearchQueryServiceTest {

    @Mock ElasticsearchOperations elasticsearchOperations;

    private BrandObjectElasticsearchQueryService queryService;

    @BeforeEach
    void setUp() {
        queryService = new BrandObjectElasticsearchQueryService(
                elasticsearchOperations,
                new SearchQuerySupport(false));
    }

    private static final BrandObjectSearchFilter NO_FILTER =
            BrandObjectSearchFilter.global(null, null, null, null);

    @Test
    void searchPage_blankKeywordSkipsElasticsearch() {
        EsSearchPageResult result = queryService.searchPage("  ", NO_FILTER, 0, 24);

        assertTrue(result.ids().isEmpty());
        assertEquals(0L, result.totalElements());
        verifyNoInteractions(elasticsearchOperations);
    }

    @Test
    void searchCount_blankKeywordReturnsEmpty() {
        EsSearchPageResult result = queryService.searchCount(null, NO_FILTER);

        assertEquals(0L, result.totalElements());
        verifyNoInteractions(elasticsearchOperations);
    }

    @Test
    void searchFacets_blankKeywordReturnsEmptyBuckets() {
        EsSearchFacetsResult result = queryService.searchFacets("", NO_FILTER);

        assertEquals(0L, result.total());
        assertTrue(result.categories().isEmpty());
        assertTrue(result.brands().isEmpty());
        verifyNoInteractions(elasticsearchOperations);
    }

    @Test
    void searchSlice_nonPositiveSizeSkipsElasticsearch() {
        EsSearchPageResult result = queryService.searchSlice("bmw", NO_FILTER, 0, 0);

        assertTrue(result.ids().isEmpty());
        verifyNoInteractions(elasticsearchOperations);
    }

    @Test
    void searchPage_mapsElasticsearchHitsToIds() {
        BrandObjectDocument document = new BrandObjectDocument(
                42L, "BMW M3", null, null, null, null, null,
                1L, "BMW", "B", null,
                null, null, null,
                null, null, null,
                null, null,
                0L);
        SearchHit<BrandObjectDocument> hit = org.mockito.Mockito.mock(SearchHit.class);
        when(hit.getContent()).thenReturn(document);
        List<SearchHit<BrandObjectDocument>> hitsList = List.of(hit);

        @SuppressWarnings("unchecked")
        SearchHits<BrandObjectDocument> hits = org.mockito.Mockito.mock(SearchHits.class);
        when(hits.iterator()).thenReturn(hitsList.iterator());
        when(hits.getTotalHits()).thenReturn(1L);
        when(hits.getTotalHitsRelation()).thenReturn(TotalHitsRelation.EQUAL_TO);
        when(elasticsearchOperations.search(any(Query.class), eq(BrandObjectDocument.class)))
                .thenReturn(hits);

        EsSearchPageResult result = queryService.searchPage("bmw", NO_FILTER, 0, 24);

        assertEquals(List.of(42L), result.ids());
        assertEquals(1L, result.totalElements());
        assertTrue(result.totalExact());
    }
}
