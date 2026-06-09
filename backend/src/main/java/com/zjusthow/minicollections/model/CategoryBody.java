package com.zjusthow.minicollections.model;

public record CategoryBody(
        String slug,
        String nameEn,
        String nameZh,
        Integer sortOrder
) {
}
