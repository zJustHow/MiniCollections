package com.zjusthow.minicollections.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BrandObjectBody(
        String nameEn,
        String nameZh,
        String imageUrl,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        String categoryEn,
        String categoryZh,
        String scale
) {
}
