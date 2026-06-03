package com.zjusthow.minicollections.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ObjectSubmissionDto(
        Long id,
        Long submittedByUserId,
        String submitterName,
        String submissionType,
        String nameEn,
        String nameZh,
        String imageUrl,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        Long brandId,
        String brandName,
        Long seriesId,
        String seriesEn,
        String seriesZh,
        Long categoryId,
        String categoryEn,
        String categoryZh,
        Long scaleId,
        String scale,
        String notes,
        String status,
        OffsetDateTime submittedAt,
        String rejectReason,
        String adminNote
) {}
