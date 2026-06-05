package com.zjusthow.minicollections.model;

import java.util.List;

public record BrandCombinedSearchDto(
        List<BrandDto> brands,
        List<BrandObjectDto> objects,
        int page,
        int size,
        long totalBrands,
        long totalObjects,
        long totalElements,
        int totalPages,
        boolean totalExact
) {
    public static BrandCombinedSearchDto empty(int page, int size) {
        return new BrandCombinedSearchDto(
                List.of(),
                List.of(),
                page,
                size,
                0L,
                0L,
                0L,
                0,
                true);
    }
}
