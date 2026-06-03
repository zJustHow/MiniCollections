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
        String notes,
        String status,
        OffsetDateTime submittedAt,
        Long reviewedByUserId,
        OffsetDateTime reviewedAt,
        String rejectReason,
        String adminNote
) {}
