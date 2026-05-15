package com.zjusthow.minicollections.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UserObjectSearchDto(
        Long id,
        Long userId,
        Long groupId,
        String groupName,
        Long brandObjectId,
        String name,
        String imageUrl,
        LocalDate purchaseDate,
        BigDecimal purchasePrice,
        String otherNotes,
        String brandObjectNameEn,
        String brandObjectNameZh,
        String brandNameEn,
        String brandNameZh
) {}
