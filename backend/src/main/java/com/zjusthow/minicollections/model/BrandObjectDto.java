package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.BrandObjectEntity;

public record BrandObjectDto(
        Long id,
        String name,
        String imageUrl,
        java.math.BigDecimal releasePrice,
        java.time.LocalDate releaseDate,
        String category,
        String scale
    ) {

    public BrandObjectDto(BrandObjectEntity entity) {
        this(
                entity.id(),
                entity.name(),
                entity.imageUrl(),
                entity.releasePrice(),
                entity.releaseDate(),
                entity.category(),
                entity.scale()
        );
    }
}
