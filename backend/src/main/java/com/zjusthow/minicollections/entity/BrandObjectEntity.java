package com.zjusthow.minicollections.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("brand_objects")
public record BrandObjectEntity(
        @Id Long id,
        Long brandId,
        String name,
        String imageUrl,
        BigDecimal releasePrice,
        LocalDate releaseDate
) {
}
