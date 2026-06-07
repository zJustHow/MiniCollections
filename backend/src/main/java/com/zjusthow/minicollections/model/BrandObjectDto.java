package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BrandObjectDto(
        Long id,
        String name,
        String nameEn,
        String nameZh,
        String imageUrl,
        String imageSource,
        BigDecimal releasePriceCny,
        BigDecimal releasePriceUsd,
        LocalDate releaseDate,
        Long brandId,
        String brand,
        String brandEn,
        String brandZh,
        Long seriesId,
        String series,
        String seriesEn,
        String seriesZh,
        Long categoryId,
        String category,
        String categoryEn,
        String categoryZh,
        Long scaleId,
        String scale,
        long viewCount
) {

    public static BrandObjectDto from(
            BrandObjectEntity entity,
            BrandEntity brand,
            SeriesEntity series,
            CategoryEntity category,
            ScaleEntity scale,
            boolean preferZh) {
        return from(entity, brand, series, category, scale, preferZh, entity.viewCount());
    }

    public static BrandObjectDto from(
            BrandObjectEntity entity,
            BrandEntity brand,
            SeriesEntity series,
            CategoryEntity category,
            ScaleEntity scale,
            boolean preferZh,
            long viewCount) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        String brandEn = brand != null ? brand.nameEn() : null;
        String brandZh = brand != null ? brand.nameZh() : null;
        String brandName = DisplayLocaleResolver.pickName(brandEn, brandZh, preferZh);
        String seriesEn = series != null ? series.nameEn() : null;
        String seriesZh = series != null ? series.nameZh() : null;
        String seriesName = DisplayLocaleResolver.pickCategory(seriesEn, seriesZh, preferZh);
        String catEn = category != null ? category.nameEn() : null;
        String catZh = category != null ? category.nameZh() : null;
        String cat = DisplayLocaleResolver.pickCategory(catEn, catZh, preferZh);
        return new BrandObjectDto(
                entity.id(),
                name,
                entity.nameEn(),
                entity.nameZh(),
                entity.imageUrl(),
                entity.imageSource(),
                entity.releasePriceCny(),
                entity.releasePriceUsd(),
                entity.releaseDate(),
                entity.brandId(),
                brandName,
                brandEn,
                brandZh,
                entity.seriesId(),
                seriesName,
                seriesEn,
                seriesZh,
                entity.categoryId(),
                cat,
                catEn,
                catZh,
                entity.scaleId(),
                scale != null ? scale.code() : null,
                viewCount
        );
    }
}
