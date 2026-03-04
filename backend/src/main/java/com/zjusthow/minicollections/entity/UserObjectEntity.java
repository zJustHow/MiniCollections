package com.zjusthow.minicollections.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("user_objects")
public record UserObjectEntity(
        @Id Long id,
        Long userId,
        Long groupId,
        Long brandObjectId,
        String name,
        String imageUrl,
        LocalDate purchaseDate,
        BigDecimal purchasePrice,
        String otherNotes
) {
}
