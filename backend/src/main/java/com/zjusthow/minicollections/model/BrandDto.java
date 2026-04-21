package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;

public record BrandDto(
        Long id,
        String name,
        String nameEn,
        String nameZh,
        String imageUrl
) {

    public static BrandDto from(BrandEntity entity, boolean preferZh) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        return new BrandDto(
                entity.id(),
                name,
                entity.nameEn(),
                entity.nameZh(),
                entity.imageUrl()
        );
    }
}
