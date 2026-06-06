package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;

public record SeriesFacetDto(
        Long id,
        String name,
        String nameEn,
        String nameZh,
        long count
) {

    public static SeriesFacetDto from(SeriesEntity entity, long count, boolean preferZh) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        return new SeriesFacetDto(
                entity.id(),
                name,
                entity.nameEn(),
                entity.nameZh(),
                count
        );
    }
}
