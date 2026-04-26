package com.zjusthow.minicollections.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("users")
public record UserEntity(
        @Id Long id,
        String email,
        String password,
        boolean enabled,
        String name,
        String preferredLocale,
        String avatarUrl
) {
    public UserEntity(Long id, String email, String password, boolean enabled, String name) {
        this(id, email, password, enabled, name, "en-US", null);
    }
}
