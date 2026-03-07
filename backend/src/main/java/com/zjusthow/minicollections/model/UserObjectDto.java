package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.UserObjectEntity;

public record UserObjectDto(
        Long id,
        Long brandObjectId,
        String name,
        String imageUrl,
        java.time.LocalDate purchaseDate,
        java.math.BigDecimal purchasePrice,
        String otherNotes
    ) {

    public UserObjectDto(UserObjectEntity entity) {
        this(
                entity.id(),
                entity.brandObjectId(),
                entity.name(),
                entity.imageUrl(),
                entity.purchaseDate(),
                entity.purchasePrice(),
                entity.otherNotes()
        );
    }
}
