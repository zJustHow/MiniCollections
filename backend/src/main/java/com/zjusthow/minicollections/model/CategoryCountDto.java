package com.zjusthow.minicollections.model;

public record CategoryCountDto(
        Long categoryId,
        String nameEn,
        String nameZh,
        long count
) {}
