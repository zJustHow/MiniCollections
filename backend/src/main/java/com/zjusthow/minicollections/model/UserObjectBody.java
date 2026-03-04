package com.zjusthow.minicollections.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UserObjectBody(
        Long brandObjectId,
        String name,
        String imageUrl,
        LocalDate purchaseDate,
        BigDecimal purchasePrice,
        String otherNotes
) {
}
