package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubmissionBody(
        @NotBlank String submissionType,
        String nameEn,
        String nameZh,
        String imageUrl,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        Long brandId,
        String customBrandName,
        Long seriesId,
        Long categoryId,
        Long scaleId,
        String notes
) {}
