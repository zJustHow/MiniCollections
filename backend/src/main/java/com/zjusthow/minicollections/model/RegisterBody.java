package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

public record RegisterBody(
        String email,
        String phone,
        @NotBlank String password,
        @NotBlank String name,
        String preferredLocale,
        @NotBlank String code
) {}
