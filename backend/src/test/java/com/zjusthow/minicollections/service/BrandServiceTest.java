package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.exception.BrandNotFoundException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandBody;
import com.zjusthow.minicollections.model.BrandCombinedSearchDto;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectBody;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.model.BrandObjectSearchFacetsDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.elasticsearch.BrandObjectIndexService;
import com.zjusthow.minicollections.elasticsearch.BrandElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.EsSearchPageResult;
import com.zjusthow.minicollections.elasticsearch.EsSearchFacetsResult;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import com.zjusthow.minicollections.repository.UserObjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BrandServiceTest {

    @Mock BrandRepository brandRepository;
    @Mock BrandObjectRepository brandObjectRepository;
    @Mock SeriesRepository seriesRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock ScaleRepository scaleRepository;
    @Mock DisplayLocaleResolver displayLocaleResolver;
    @Mock BrandObjectIndexService brandObjectIndexService;
    @Mock BrandElasticsearchQueryService brandElasticsearchQueryService;
    @Mock BrandObjectElasticsearchQueryService brandObjectElasticsearchQueryService;
    @Mock UserObjectRepository userObjectRepository;
    @Mock ViewCountService viewCountService;

    @InjectMocks BrandService brandService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(brandService, "self", brandService);
        ReflectionTestUtils.setField(brandService, "elasticsearchEnabled", false);
    }

    @Test
    void searchCombinedPage_blankKeywordReturnsEmpty() {
        BrandCombinedSearchDto result = brandService.searchCombinedPage(
                "  ", null, null, null, null, "en-US", 1, 24);

        assertTrue(result.brands().isEmpty());
        assertTrue(result.objects().isEmpty());
        assertEquals(1, result.page());
        assertEquals(24, result.size());
    }

    @Test
    void searchBrandsPage_blankKeywordReturnsEmptyPage() {
        PageResponse<BrandDto> response = brandService.searchBrandsPage(" ", "en-US", 2, 24);

        assertTrue(response.content().isEmpty());
        assertEquals(2, response.page());
        verify(brandRepository, never()).countSearch(any());
    }

    @Test
    void getBrandByIdCached_missingBrandThrows() {
        when(brandRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(BrandNotFoundException.class,
                () -> brandService.getBrandByIdCached(99L, false));
    }

    @Test
    void getBrandById_enrichesViewCount() {
        BrandEntity entity = new BrandEntity(5L, "Kyosho", "京商", "K", null, 10L);
        when(brandRepository.findById(5L)).thenReturn(Optional.of(entity));
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(viewCountService.displayBrandViewCount(5L, 10L)).thenReturn(42L);

        BrandDto dto = brandService.getBrandById(5L, "en-US");

        assertEquals("Kyosho", dto.name());
        assertEquals(42L, dto.viewCount());
    }

    @Test
    void getBrandsPage_mapsEntitiesToDtos() {
        BrandEntity entity = new BrandEntity(1L, "Mini GT", null, "MG", null, 0L);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(brandRepository.countAll()).thenReturn(1L);
        when(brandRepository.findPage(48, 0)).thenReturn(List.of(entity));

        PageResponse<BrandDto> response = brandService.getBrandsPage("en-US", 0, 48);

        assertEquals(1, response.content().size());
        assertEquals("Mini GT", response.content().get(0).name());
    }

    @Test
    void createBrand_persistsEntity() {
        BrandBody body = new BrandBody("Kyosho", "京商", "K", null);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(brandRepository.save(any())).thenAnswer(invocation -> {
            BrandEntity saved = invocation.getArgument(0);
            return new BrandEntity(3L, saved.nameEn(), saved.nameZh(), saved.abbreviation(), saved.imageUrl(), 0L);
        });

        BrandDto dto = brandService.createBrand(body, "en-US");

        assertEquals(3L, dto.id());
        assertEquals("Kyosho", dto.name());
    }

    @Test
    void createBrandObject_rejectsSeriesBrandMismatch() {
        when(seriesRepository.findById(10L)).thenReturn(Optional.of(new SeriesEntity(10L, 2L, "S", null)));

        BrandObjectBody body = new BrandObjectBody(
                "Model", null, null, null, null, null, null, 10L, null, null);

        assertThrows(ValidationException.class,
                () -> brandService.createBrandObject(1L, body, "en-US"));
        verify(brandObjectRepository, never()).save(any());
    }

    @Test
    void createBrandObject_persistsWhenValid() {
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        BrandObjectBody body = new BrandObjectBody(
                "Model EN", "模型", null, null, null, null, null, null, null, null);
        when(brandObjectRepository.save(any())).thenAnswer(invocation -> {
            BrandObjectEntity saved = invocation.getArgument(0);
            return new BrandObjectEntity(
                    7L, saved.nameEn(), saved.nameZh(), saved.imageUrl(), saved.imageSource(),
                    saved.releasePriceCny(), saved.releasePriceUsd(), saved.releaseDate(),
                    saved.brandId(), saved.seriesId(), saved.categoryId(), saved.scaleId(), 0L);
        });

        BrandObjectDto dto = brandService.createBrandObject(1L, body, "en-US");

        assertEquals(7L, dto.id());
        assertEquals("Model EN", dto.name());
        verify(brandObjectIndexService).index(any());
    }

    @Test
    void searchBrandsPage_usesElasticsearchWhenEnabled() {
        ReflectionTestUtils.setField(brandService, "elasticsearchEnabled", true);
        BrandEntity entity = new BrandEntity(5L, "BMW", null, "BMW", null, 0L);
        when(brandElasticsearchQueryService.searchPage("bmw", 0, 24))
                .thenReturn(new EsSearchPageResult(List.of(5L), 1L, true));
        when(brandRepository.findAllById(any())).thenReturn(List.of(entity));
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);

        PageResponse<BrandDto> response = brandService.searchBrandsPage("bmw", "en-US", 0, 24);

        assertEquals(1, response.content().size());
        assertEquals("BMW", response.content().get(0).name());
        verify(brandElasticsearchQueryService).searchPage("bmw", 0, 24);
        verify(brandRepository, never()).countSearch(any());
    }

    @Test
    void searchCombinedPage_usesElasticsearchWhenEnabled() {
        ReflectionTestUtils.setField(brandService, "elasticsearchEnabled", true);
        BrandEntity brand = new BrandEntity(1L, "BMW", null, "BMW", null, 0L);
        when(brandElasticsearchQueryService.searchSlice("bmw", 0, 48))
                .thenReturn(new EsSearchPageResult(List.of(1L), 1L, true));
        when(brandObjectElasticsearchQueryService.searchSlice(
                eq("bmw"), org.mockito.ArgumentMatchers.any(), eq(0), eq(47)))
                .thenReturn(new EsSearchPageResult(List.of(), 3L, true));
        when(brandRepository.findAllById(any())).thenReturn(List.of(brand));
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);

        BrandCombinedSearchDto result = brandService.searchCombinedPage(
                "bmw", null, null, null, null, "en-US", 0, 48);

        assertEquals(1, result.brands().size());
        assertEquals("BMW", result.brands().get(0).name());
        assertEquals(3L, result.totalObjects());
        verify(brandElasticsearchQueryService).searchSlice("bmw", 0, 48);
    }

    @Test
    void searchBrandsPage_usesSqlWhenElasticsearchDisabled() {
        BrandEntity entity = new BrandEntity(5L, "BMW", null, "BMW", null, 0L);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(brandRepository.countSearch("bmw")).thenReturn(1L);
        when(brandRepository.searchPage("bmw", 24, 0)).thenReturn(List.of(entity));

        PageResponse<BrandDto> response = brandService.searchBrandsPage("bmw", "en-US", 0, 24);

        assertEquals(1, response.content().size());
        assertEquals("BMW", response.content().get(0).name());
        verify(brandRepository).countSearch("bmw");
        verifyNoInteractions(brandElasticsearchQueryService);
    }

    @Test
    void searchBrandsPage_fallsBackToSqlWhenElasticsearchFails() {
        ReflectionTestUtils.setField(brandService, "elasticsearchEnabled", true);
        BrandEntity entity = new BrandEntity(5L, "BMW", null, "BMW", null, 0L);
        when(brandElasticsearchQueryService.searchPage("bmw", 0, 24))
                .thenThrow(new RuntimeException("ES unavailable"));
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(brandRepository.countSearch("bmw")).thenReturn(1L);
        when(brandRepository.searchPage("bmw", 24, 0)).thenReturn(List.of(entity));

        PageResponse<BrandDto> response = brandService.searchBrandsPage("bmw", "en-US", 0, 24);

        assertEquals(1, response.content().size());
        verify(brandRepository).countSearch("bmw");
    }

    @Test
    void searchCombinedPage_usesSqlWhenElasticsearchDisabled() {
        BrandEntity brand = new BrandEntity(1L, "BMW", null, "BMW", null, 0L);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(brandRepository.countSearch("bmw")).thenReturn(1L);
        when(brandRepository.searchPage("bmw", 1, 0)).thenReturn(List.of(brand));
        when(brandObjectRepository.countSearch(
                eq("bmw"),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any()))
                .thenReturn(0L);

        BrandCombinedSearchDto result = brandService.searchCombinedPage(
                "bmw", null, null, null, null, "en-US", 0, 48);

        assertEquals(1, result.brands().size());
        assertEquals(0L, result.totalObjects());
        verifyNoInteractions(brandElasticsearchQueryService);
    }

    @Test
    void searchBrandObjectsPage_usesSqlWhenElasticsearchDisabled() {
        BrandEntity brand = new BrandEntity(9L, "BMW", null, "BMW", null, 0L);
        BrandObjectEntity entity = new BrandObjectEntity(
                42L, "BMW M3", null, null, null, null, null, null,
                9L, null, null, null, 0L);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(brandObjectRepository.countSearch(
                eq("m3"),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any()))
                .thenReturn(1L);
        when(brandObjectRepository.searchPage(
                eq("m3"),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                org.mockito.ArgumentMatchers.anyBoolean(),
                any(),
                eq(24),
                eq(0)))
                .thenReturn(List.of(entity));
        when(brandRepository.findAllById(any())).thenReturn(List.of(brand));

        PageResponse<BrandObjectDto> response =
                brandService.searchBrandObjectsPage("m3", "en-US", 0, 24);

        assertEquals(1, response.content().size());
        assertEquals("BMW M3", response.content().get(0).nameEn());
        verifyNoInteractions(brandObjectElasticsearchQueryService);
    }

    @Test
    void searchBrandObjectsFacets_usesSqlWhenElasticsearchDisabled() {
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(brandObjectRepository.countSearch(
                eq("bmw"),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList()))
                .thenReturn(5L);
        when(brandObjectRepository.countByCategorySearch(
                eq("bmw"),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList()))
                .thenReturn(List.of());
        when(brandObjectRepository.countByBrandSearch(
                eq("bmw"),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList()))
                .thenReturn(List.of());
        when(brandObjectRepository.countByScaleSearch(
                eq("bmw"),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList()))
                .thenReturn(List.of());
        when(brandObjectRepository.countBySeriesSearch(
                eq("bmw"),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList(),
                anyBoolean(),
                anyList()))
                .thenReturn(List.of());

        BrandObjectSearchFacetsDto result = brandService.searchBrandObjectsFacets(
                "bmw", null, null, null, null, "en-US");

        assertEquals(5L, result.total());
        assertTrue(result.categories().isEmpty());
        verifyNoInteractions(brandObjectElasticsearchQueryService);
    }

    @Test
    void searchBrandObjectsFacets_usesElasticsearchWhenEnabled() {
        ReflectionTestUtils.setField(brandService, "elasticsearchEnabled", true);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        when(brandObjectElasticsearchQueryService.searchFacets(eq("bmw"), any()))
                .thenReturn(new EsSearchFacetsResult(3L, List.of(), List.of(), List.of(), List.of()));

        BrandObjectSearchFacetsDto result = brandService.searchBrandObjectsFacets(
                "bmw", null, null, null, null, "en-US");

        assertEquals(3L, result.total());
        verify(brandObjectElasticsearchQueryService).searchFacets(eq("bmw"), any());
        verify(brandObjectRepository, never()).countSearch(
                any(), anyBoolean(), anyList(), anyBoolean(), anyList(),
                anyBoolean(), anyList(), anyBoolean(), anyList());
    }
}
