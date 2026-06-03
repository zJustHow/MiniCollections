package com.zjusthow.minicollections.elasticsearch;

import java.util.List;

public record EsCategoryFacetsResult(
        long total,
        List<EsCategoryFacetBucket> buckets
) {
}
