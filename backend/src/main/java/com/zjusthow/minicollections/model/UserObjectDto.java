package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.UserObjectEntity;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UserObjectDto(
        Long id,
        Long userId,
        Long groupId,
        Long brandObjectId,
        String name,
        String imageUrl,
        LocalDate purchaseDate,
        BigDecimal purchasePrice,
        String otherNotes
) {

    public UserObjectDto(UserObjectEntity entity) {
        this(
                entity.id(),
                entity.userId(),
                entity.groupId(),
                entity.brandObjectId(),
                entity.name(),
                entity.imageUrl(),
                entity.purchaseDate(),
                entity.purchasePrice(),
                entity.otherNotes()
        );
    }
}
