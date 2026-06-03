package com.zjusthow.minicollections.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("scales")
public record ScaleEntity(
        @Id Long id,
        String code,
        int denominator,
        int sortOrder
) {
}
