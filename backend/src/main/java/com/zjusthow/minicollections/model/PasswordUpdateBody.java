package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordUpdateBody(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 6) String newPassword
) {}
