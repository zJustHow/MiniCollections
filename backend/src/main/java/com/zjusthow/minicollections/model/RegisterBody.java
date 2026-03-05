package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterBody(
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotBlank String name
) {
}
