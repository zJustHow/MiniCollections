package com.zjusthow.minicollections.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("series")
public record SeriesEntity(
        @Id Long id,
        Long brandId,
        String nameEn,
        String nameZh
) {
}
