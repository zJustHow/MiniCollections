package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

public record UserLocaleBody(
        @NotBlank String preferredLocale
) {
}
