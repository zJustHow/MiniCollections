package com.zjusthow.minicollections.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.bootstrap")
public record BootstrapProperties(
        String adminEmail,
        String adminPassword,
        String adminName,
        String adminLocale
) {
}
