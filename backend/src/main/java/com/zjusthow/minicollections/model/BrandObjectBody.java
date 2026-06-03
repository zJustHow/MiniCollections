package com.zjusthow.minicollections.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BrandObjectBody(
        String nameEn,
        String nameZh,
        String imageUrl,
        String imageSource,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        Long seriesId,
        Long categoryId,
        Long scaleId
) {
}
