package com.zjusthow.minicollections.elasticsearch;

/**
 * Bump when denormalized search fields change (category/scale/series taxonomy, mapping, analyzers).
 * Startup compares this to the version stored in {@code search-index-meta}.
 */
public final class BrandObjectIndexVersion {

    /** Increment when seed taxonomy or {@link BrandObjectDocument} denormalized fields change. */
    public static final int CURRENT = 5;

    public static final String META_ID = "brand-objects";

    private BrandObjectIndexVersion() {
    }
}
