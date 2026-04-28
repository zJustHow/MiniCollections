package com.zjusthow.minicollections.model;

public record UserProfileDto(
        Long id,
        String email,
        String displayName,
        String preferredLocale,
        String avatarUrl
) {}
