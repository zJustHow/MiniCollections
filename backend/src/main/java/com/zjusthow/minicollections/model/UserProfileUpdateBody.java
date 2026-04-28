package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateBody(
        @NotBlank @Size(max = 64) String displayName
) {}
