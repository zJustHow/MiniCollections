package com.zjusthow.minicollections.model;

public record UserProfileDto(
        Long id,
        String email,
        String phone,
        String displayName,
        String preferredLocale,
        String avatarUrl,
        boolean admin,
        boolean wechatBound,
        boolean passwordSet
) {}
