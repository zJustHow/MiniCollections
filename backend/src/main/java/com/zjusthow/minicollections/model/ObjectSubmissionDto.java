package com.zjusthow.minicollections.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ObjectSubmissionDto(
        Long id,
        Long submittedByUserId,
        String submitterName,
        String submissionType,
        Long brandId,
        String brandName,
        String nameEn,
        String nameZh,
        String imageUrl,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        String categoryEn,
        String categoryZh,
        String scale,
        String notes,
        String status,
        OffsetDateTime submittedAt,
        String rejectReason,
        String adminNote
) {}
