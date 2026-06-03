package com.zjusthow.minicollections.model;

import java.util.List;

public record BrandObjectSearchFacetsDto(
        long total,
        List<CategoryFacetDto> categories,
        List<BrandFacetDto> brands,
        List<ScaleFacetDto> scales
) {
}
