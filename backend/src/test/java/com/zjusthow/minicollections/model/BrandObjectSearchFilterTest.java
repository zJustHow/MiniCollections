package com.zjusthow.minicollections.model;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BrandObjectSearchFilterTest {

    @Test
    void global_normalizesEmptyListsToNull() {
        BrandObjectSearchFilter filter = BrandObjectSearchFilter.global(null, List.of(), null, null);
        assertNull(filter.categoryIds());
        assertNull(filter.brandIds());
        assertFalse(filter.filterCategories());
        assertFalse(filter.filterBrands());
    }

    @Test
    void withinBrand_ignoresBrandFacetFilters() {
        BrandObjectSearchFilter filter = BrandObjectSearchFilter.withinBrand(5L, List.of(1L), List.of(2L), List.of(3L));
        assertEquals(5L, filter.scopeBrandId());
        assertNull(filter.brandIds());
        assertFalse(filter.filterBrands());
        assertTrue(filter.hasActiveFilters());
        assertTrue(filter.hasUserFilters());
    }

    @Test
    void unusedInSentinelWhenDimensionNotFiltered() {
        BrandObjectSearchFilter filter = BrandObjectSearchFilter.global(null, null, null, null);
        assertEquals(List.of(-1L), filter.categoryIdsParam());
        assertEquals(List.of(-1L), filter.brandIdsParam());
        assertEquals(List.of(-1L), filter.scaleIdsParam());
        assertEquals(List.of(-1L), filter.seriesIdsParam());
    }

    @Test
    void facetBucketHelpers_dropSelfDimension() {
        BrandObjectSearchFilter filter = BrandObjectSearchFilter.global(
                List.of(1L), List.of(2L), List.of(3L), List.of(4L));

        assertNull(filter.forCategoryFacetBuckets().categoryIds());
        assertTrue(filter.forCategoryFacetBuckets().filterBrands());

        assertNull(filter.forScaleFacetBuckets().scaleIds());
        assertTrue(filter.forScaleFacetBuckets().filterCategories());

        assertNull(filter.forSeriesFacetBuckets().seriesIds());

        assertNull(filter.forBrandFacetBuckets().scopeBrandId());
        assertNull(filter.forBrandFacetBuckets().brandIds());
        assertTrue(filter.forBrandFacetBuckets().filterCategories());
    }
}
