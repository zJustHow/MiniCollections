package com.zjusthow.minicollections.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("user_identifiers")
public record UserIdentifierEntity(
        @Id Long id,
        Long userId,
        String type,
        String identifier
) {}
