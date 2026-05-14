package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BrandObjectDto(
        Long id,
        Long brandId,
        String name,
        String nameEn,
        String nameZh,
        String imageUrl,
        BigDecimal releasePrice,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        String category,
        String categoryEn,
        String categoryZh,
        String scale
) {

    public static BrandObjectDto from(BrandObjectEntity entity, boolean preferZh, boolean preferCny) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        String cat = DisplayLocaleResolver.pickCategory(entity.categoryEn(), entity.categoryZh(), preferZh);
        BigDecimal price = DisplayLocaleResolver.pickPrice(
                entity.releasePriceCny(), entity.releasePriceUsd(), preferCny);
        return new BrandObjectDto(
                entity.id(),
                entity.brandId(),
                name,
                entity.nameEn(),
                entity.nameZh(),
                entity.imageUrl(),
                price,
                entity.releasePriceCny(),
                entity.releasePriceUsd(),
                entity.releaseDate(),
                cat,
                entity.categoryEn(),
                entity.categoryZh(),
                entity.scale()
        );
    }
}
