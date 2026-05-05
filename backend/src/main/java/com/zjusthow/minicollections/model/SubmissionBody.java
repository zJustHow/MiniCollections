package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubmissionBody(
        @NotBlank String submissionType,
        Long brandId,
        String customBrandName,
        String nameEn,
        String nameZh,
        String imageUrl,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        String categoryEn,
        String categoryZh,
        String scale,
        String notes
) {}
