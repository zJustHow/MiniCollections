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
        String imageSource,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        String category,
        String categoryEn,
        String categoryZh,
        String scale,
        long viewCount,
        long groupAddCount
) {

    public static BrandObjectDto from(BrandObjectEntity entity, boolean preferZh) {
        return from(entity, preferZh, 0L);
    }

    public static BrandObjectDto from(BrandObjectEntity entity, boolean preferZh, long groupAddCount) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        String cat = DisplayLocaleResolver.pickCategory(entity.categoryEn(), entity.categoryZh(), preferZh);
        long views = entity.viewCount() != null ? entity.viewCount() : 0L;
        return new BrandObjectDto(
                entity.id(),
                entity.brandId(),
                name,
                entity.nameEn(),
                entity.nameZh(),
                entity.imageUrl(),
                entity.imageSource(),
                entity.releasePriceCny(),
                entity.releasePriceUsd(),
                entity.releaseDate(),
                cat,
                entity.categoryEn(),
                entity.categoryZh(),
                entity.scale(),
                views,
                groupAddCount
        );
    }
}
