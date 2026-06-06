package com.zjusthow.minicollections.model;

import java.util.List;

public record BrandObjectSearchFilter(
        Long scopeBrandId,
        List<Long> categoryIds,
        List<Long> brandIds,
        List<Long> scaleIds,
        List<Long> seriesIds
) {

    private static final List<Long> UNUSED_IN = List.of(-1L);

    public static BrandObjectSearchFilter global(
            List<Long> categoryIds,
            List<Long> brandIds,
            List<Long> scaleIds,
            List<Long> seriesIds) {
        return new BrandObjectSearchFilter(
                null,
                normalize(categoryIds),
                normalize(brandIds),
                normalize(scaleIds),
                normalize(seriesIds));
    }

    public static BrandObjectSearchFilter withinBrand(
            long scopeBrandId,
            List<Long> categoryIds,
            List<Long> scaleIds,
            List<Long> seriesIds) {
        return new BrandObjectSearchFilter(
                scopeBrandId,
                normalize(categoryIds),
                null,
                normalize(scaleIds),
                normalize(seriesIds));
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

    public boolean filterSeries() {
        return seriesIds != null && !seriesIds.isEmpty();
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

    public List<Long> seriesIdsParam() {
        return filterSeries() ? seriesIds : UNUSED_IN;
    }

    public boolean hasActiveFilters() {
        return scopeBrandId != null
                || filterCategories()
                || filterBrands()
                || filterScales()
                || filterSeries();
    }

    /** User-selected facet dimensions (excludes page scope such as within-brand). */
    public boolean hasUserFilters() {
        return filterCategories() || filterBrands() || filterScales() || filterSeries();
    }

    /** Cross-dimension facet buckets: category counts respect scale/series, not category. */
    public BrandObjectSearchFilter forCategoryFacetBuckets() {
        return new BrandObjectSearchFilter(scopeBrandId, null, brandIds, scaleIds, seriesIds);
    }

    public BrandObjectSearchFilter forScaleFacetBuckets() {
        return new BrandObjectSearchFilter(scopeBrandId, categoryIds, brandIds, null, seriesIds);
    }

    public BrandObjectSearchFilter forSeriesFacetBuckets() {
        return new BrandObjectSearchFilter(scopeBrandId, categoryIds, brandIds, scaleIds, null);
    }

    public BrandObjectSearchFilter forBrandFacetBuckets() {
        return new BrandObjectSearchFilter(null, categoryIds, null, scaleIds, seriesIds);
    }
}
