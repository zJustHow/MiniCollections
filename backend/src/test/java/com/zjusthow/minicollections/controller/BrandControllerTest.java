package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandCombinedSearchDto;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.model.BrandObjectSearchFacetsDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.SeriesDto;
import com.zjusthow.minicollections.service.BrandService;
import com.zjusthow.minicollections.service.SeriesService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class BrandControllerTest {

    @Mock BrandService brandService;
    @Mock SeriesService seriesService;
    @Mock DisplayLocaleResolver displayLocaleResolver;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new BrandController(brandService, seriesService, displayLocaleResolver))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
        when(displayLocaleResolver.resolveEffectiveLocale(
                        nullable(String.class),
                        nullable(org.springframework.security.core.userdetails.User.class)))
                .thenReturn("en-US");
    }

    @Test
    void getBrands_returnsPagedBrands() throws Exception {
        BrandDto brand = new BrandDto(1L, "Kyosho", "Kyosho", null, "K", null, 0L);
        when(brandService.getBrandsPage("en-US", 0, 48))
                .thenReturn(PageResponse.of(List.of(brand), 0, 48, 1, true));

        mockMvc.perform(get("/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Kyosho"));
    }

    @Test
    void searchBrandsCombined_passesFiltersAndLocale() throws Exception {
        when(brandService.searchCombinedPage(
                eq("bmw"), isNull(), isNull(), isNull(), isNull(), eq("en-US"), eq(0), eq(48)))
                .thenReturn(BrandCombinedSearchDto.empty(0, 48));

        mockMvc.perform(get("/brands/search/combined")
                        .param("keyword", "bmw"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));

        verify(brandService).searchCombinedPage(
                eq("bmw"), isNull(), isNull(), isNull(), isNull(), eq("en-US"), eq(0), eq(48));
    }

    @Test
    void getBrandById_returnsBrand() throws Exception {
        BrandDto brand = new BrandDto(9L, "Mini GT", "Mini GT", null, "MG", null, 3L);
        when(brandService.getBrandById(9L, "en-US")).thenReturn(brand);

        mockMvc.perform(get("/brands/9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(9))
                .andExpect(jsonPath("$.name").value("Mini GT"));
    }

    @Test
    void searchBrands_returnsPagedResults() throws Exception {
        BrandDto brand = new BrandDto(2L, "BMW", "BMW", null, "BMW", null, 0L);
        when(brandService.searchBrandsPage("bmw", "en-US", 0, 48))
                .thenReturn(PageResponse.of(List.of(brand), 0, 48, 1, true));

        mockMvc.perform(get("/brands/search").param("keyword", "bmw"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("BMW"));
    }

    @Test
    void getSeriesByBrandId_returnsSeriesList() throws Exception {
        SeriesDto series = new SeriesDto(3L, 9L, "GT Series", "GT Series", null);
        when(seriesService.listByBrandId(9L, "en-US")).thenReturn(List.of(series));

        mockMvc.perform(get("/brands/9/series"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nameEn").value("GT Series"));
    }

    @Test
    void getBrandObjectsByBrandId_returnsPagedObjects() throws Exception {
        BrandObjectDto object = sampleObjectDto();
        when(brandService.getBrandObjectsPage(9L, "en-US", 0, 48))
                .thenReturn(PageResponse.of(List.of(object), 0, 48, 1, true));

        mockMvc.perform(get("/brands/9/objects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nameEn").value("Model A"));
    }

    @Test
    void searchBrandObjects_returnsSearchResults() throws Exception {
        BrandObjectDto object = sampleObjectDto();
        when(brandService.searchBrandObjectsPage(
                eq("m3"), isNull(), isNull(), isNull(), isNull(), eq("en-US"), eq(0), eq(48)))
                .thenReturn(PageResponse.of(List.of(object), 0, 48, 1, true));

        mockMvc.perform(get("/brands/objects/search").param("keyword", "m3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nameEn").value("Model A"));
    }

    @Test
    void searchBrandObjectsFacets_returnsFacetBuckets() throws Exception {
        BrandObjectSearchFacetsDto facets =
                new BrandObjectSearchFacetsDto(0L, List.of(), List.of(), List.of(), List.of());
        when(brandService.searchBrandObjectsFacets(
                eq("bmw"), isNull(), isNull(), isNull(), isNull(), eq("en-US")))
                .thenReturn(facets);

        mockMvc.perform(get("/brands/objects/search/facets").param("keyword", "bmw"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void getBrandObjectById_returnsObject() throws Exception {
        BrandObjectDto object = sampleObjectDto();
        when(brandService.getBrandObjectById(42L, "en-US")).thenReturn(object);

        mockMvc.perform(get("/brands/objects/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42));
    }

    private static BrandObjectDto sampleObjectDto() {
        return new BrandObjectDto(
                42L, "Model A", "Model A", null, null, null,
                null, null, null,
                9L, "Brand", "Brand", null,
                null, null, null, null,
                null, null, null, null,
                null, null, 0L);
    }
}
