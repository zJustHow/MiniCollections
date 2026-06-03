package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;

public record BrandFacetDto(
        Long id,
        String name,
        String nameEn,
        String nameZh,
        long count
) {

    public static BrandFacetDto from(BrandEntity entity, long count, boolean preferZh) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        return new BrandFacetDto(
                entity.id(),
                name,
                entity.nameEn(),
                entity.nameZh(),
                count
        );
    }
}
