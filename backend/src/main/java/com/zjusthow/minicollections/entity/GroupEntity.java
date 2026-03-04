package com.zjusthow.minicollections.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("groups")
public record GroupEntity(
        @Id Long id,
        Long userId,
        String name,
        String imageUrl
) {
}
