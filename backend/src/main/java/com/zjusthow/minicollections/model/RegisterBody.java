package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

public record RegisterBody(
        @NotBlank String email,
        @NotBlank String password,
        @NotBlank String name,
        String preferredLocale
) {}
