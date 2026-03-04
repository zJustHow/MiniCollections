package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.BrandEntity;

import java.util.List;

public record BrandDto(
        Long id,
        String name,
        String imageUrl,
        List<BrandObjectDto> brandObjects
) {

    public BrandDto (BrandEntity entity, List<BrandObjectDto> brandObjects) {
        this(entity.id(), entity.name(), entity.imageUrl(), brandObjects);
    }

    public BrandEntity toEntity() {
        return new BrandEntity(this.id, this.name, this.imageUrl);
    }
}
