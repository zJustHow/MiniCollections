package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.BrandEntity;

public record BrandDto(
        Long id,
        String name,
        String imageUrl
    ) {

    public BrandDto(BrandEntity entity) {
        this(entity.id(), entity.name(), entity.imageUrl());
    }

    public BrandEntity toEntity() {
        return new BrandEntity(this.id, this.name, this.imageUrl);
    }
}
