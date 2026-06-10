package com.zjusthow.minicollections.model;

public record BrandCountDto(
        Long brandId,
        String nameEn,
        String nameZh,
        long count
) {}
