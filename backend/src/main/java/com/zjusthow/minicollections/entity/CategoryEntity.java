package com.zjusthow.minicollections.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("categories")
public record CategoryEntity(
        @Id Long id,
        String slug,
        String nameEn,
        String nameZh,
        int sortOrder
) {
}
