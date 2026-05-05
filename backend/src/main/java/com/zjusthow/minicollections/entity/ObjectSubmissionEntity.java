package com.zjusthow.minicollections.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Table("object_submissions")
public record ObjectSubmissionEntity(
        @Id Long id,
        Long submittedByUserId,
        String submissionType,
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
        String notes,
        String status,
        OffsetDateTime submittedAt,
        Long reviewedByUserId,
        OffsetDateTime reviewedAt,
        String rejectReason,
        String adminNote
) {}
