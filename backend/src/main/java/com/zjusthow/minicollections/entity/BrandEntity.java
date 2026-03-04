package com.zjusthow.minicollections.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("brands")
public record BrandEntity(
        @Id Long id,
        String name,
        String imageUrl
) {
}
