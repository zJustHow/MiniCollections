package com.zjusthow.minicollections.elasticsearch;

public record EsCategoryFacetBucket(
        long categoryId,
        long count
) {
}
