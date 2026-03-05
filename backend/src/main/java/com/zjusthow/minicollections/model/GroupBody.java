package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

public record GroupBody(
        @NotBlank String name,
        String imageUrl
) {
}