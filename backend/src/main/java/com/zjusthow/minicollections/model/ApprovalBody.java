package com.zjusthow.minicollections.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ApprovalBody(
        Long brandId,
        String nameEn,
        String nameZh,
        String imageUrl,
        String imageSource,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        String categoryEn,
        String categoryZh,
        String scale,
        String adminNote
) {}
