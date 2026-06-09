package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;

public record CategoryDto(
        Long id,
        String slug,
        String name,
        String nameEn,
        String nameZh,
        int sortOrder
) {

    public static CategoryDto from(CategoryEntity entity, boolean preferZh) {
        String name = DisplayLocaleResolver.pickName(entity.nameEn(), entity.nameZh(), preferZh);
        return new CategoryDto(
                entity.id(),
                entity.slug(),
                name,
                entity.nameEn(),
                entity.nameZh(),
                entity.sortOrder()
        );
    }
}
