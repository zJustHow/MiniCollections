package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordSendCodeRequest(
        @NotBlank String target,
        @NotBlank String type
) {}
