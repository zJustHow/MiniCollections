package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

public record SendCodeRequest(
        @NotBlank String target,
        @NotBlank String type
) {}
