package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.ScaleEntity;

public record ScaleFacetDto(
        Long id,
        String code,
        long count
) {

    public static ScaleFacetDto from(ScaleEntity entity, long count) {
        return new ScaleFacetDto(entity.id(), entity.code(), count);
    }
}
