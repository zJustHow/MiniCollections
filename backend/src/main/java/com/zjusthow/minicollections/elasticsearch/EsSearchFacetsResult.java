package com.zjusthow.minicollections.elasticsearch;

import java.util.List;

public record EsSearchFacetsResult(
        long total,
        List<EsFacetBucket> categories,
        List<EsFacetBucket> brands,
        List<EsFacetBucket> scales,
        List<EsFacetBucket> series
) {
}
