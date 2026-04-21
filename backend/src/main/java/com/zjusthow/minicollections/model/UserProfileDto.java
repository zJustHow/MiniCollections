package com.zjusthow.minicollections.model;

public record UserProfileDto(
        Long id,
        String email,
        String name,
        String preferredLocale
) {
}
