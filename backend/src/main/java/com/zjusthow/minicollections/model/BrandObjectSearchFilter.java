package com.zjusthow.minicollections.model;

import java.util.List;

public record BrandObjectSearchFilter(
        Long scopeBrandId,
        List<Long> categoryIds,
        List<Long> brandIds,
        List<Long> scaleIds
) {

    private static final List<Long> UNUSED_IN = List.of(-1L);

    public static BrandObjectSearchFilter global(
            List<Long> categoryIds,
            List<Long> brandIds,
            List<Long> scaleIds) {
        return new BrandObjectSearchFilter(
                null,
                normalize(categoryIds),
                normalize(brandIds),
                normalize(scaleIds));
    }

    public static BrandObjectSearchFilter withinBrand(
            long scopeBrandId,
            List<Long> categoryIds,
            List<Long> scaleIds) {
        return new BrandObjectSearchFilter(
                scopeBrandId,
                normalize(categoryIds),
                null,
                normalize(scaleIds));
    }

    private static List<Long> normalize(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return null;
        }
        return List.copyOf(ids);
    }

    public boolean filterCategories() {
        return categoryIds != null && !categoryIds.isEmpty();
    }

    public boolean filterBrands() {
        return scopeBrandId == null && brandIds != null && !brandIds.isEmpty();
    }

    public boolean filterScales() {
        return scaleIds != null && !scaleIds.isEmpty();
    }

    public List<Long> categoryIdsParam() {
        return filterCategories() ? categoryIds : UNUSED_IN;
    }

    public List<Long> brandIdsParam() {
        return filterBrands() ? brandIds : UNUSED_IN;
    }

    public List<Long> scaleIdsParam() {
        return filterScales() ? scaleIds : UNUSED_IN;
    }

    public boolean hasActiveFilters() {
        return scopeBrandId != null || filterCategories() || filterBrands() || filterScales();
    }
}
