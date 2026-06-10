package com.zjusthow.minicollections.model;

import java.util.List;

public record CollectionStatsDto(
        long totalObjects,
        List<CategoryCountDto> byCategory,
        List<BrandCountDto> byBrand,
        List<PurchaseTrendPointDto> purchaseTrend
) {}
