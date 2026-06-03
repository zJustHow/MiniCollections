package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;

public record CategoryFacetDto(
        Long id,
        String slug,
        String name,
        String nameEn,
        String nameZh,
        long count
) {

    public static CategoryFacetDto from(CategoryEntity entity, long count, boolean preferZh) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        return new CategoryFacetDto(
                entity.id(),
                entity.slug(),
                name,
                entity.nameEn(),
                entity.nameZh(),
                count
        );
    }
}
