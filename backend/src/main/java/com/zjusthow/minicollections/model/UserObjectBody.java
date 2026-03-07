package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UserObjectBody(
        Long brandObjectId,
        @NotBlank String name,
        String imageUrl,
        LocalDate purchaseDate,
        BigDecimal purchasePrice,
        String otherNotes
        ) {
}
