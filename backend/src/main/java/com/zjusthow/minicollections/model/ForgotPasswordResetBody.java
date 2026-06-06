package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordResetBody(
        String email,
        String phone,
        @NotBlank String code,
        @NotBlank @Size(min = 6) String newPassword
) {}
