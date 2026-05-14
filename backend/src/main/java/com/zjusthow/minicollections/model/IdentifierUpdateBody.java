package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record IdentifierUpdateBody(
        @NotBlank @Pattern(regexp = "email|phone") String type,
        @NotBlank String identifier,
        @NotBlank String code
) {}
