package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.ScaleEntity;

public record ScaleDto(
        Long id,
        String code
) {

    public static ScaleDto from(ScaleEntity entity) {
        return new ScaleDto(entity.id(), entity.code());
    }
}
