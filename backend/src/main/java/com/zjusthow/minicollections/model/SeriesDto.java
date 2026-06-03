package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;

public record SeriesDto(
        Long id,
        Long brandId,
        String name,
        String nameEn,
        String nameZh
) {

    public static SeriesDto from(SeriesEntity entity, boolean preferZh) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        return new SeriesDto(
                entity.id(),
                entity.brandId(),
                name,
                entity.nameEn(),
                entity.nameZh()
        );
    }
}
