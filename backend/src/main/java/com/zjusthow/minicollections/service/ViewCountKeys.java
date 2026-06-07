package com.zjusthow.minicollections.service;

import java.util.Optional;

final class ViewCountKeys {

    static final String PENDING_PREFIX = "views:pending:";
    static final String DEDUP_PREFIX = "views:dedup:";
    static final String DAILY_UV_PREFIX = "views:daily-uv:";

    private ViewCountKeys() {
    }

    static String entityType(String kind) {
        return "brand".equals(kind) ? "BRAND" : "MODEL";
    }

    static String pendingKey(String kind, long id) {
        return PENDING_PREFIX + kind + ":" + id;
    }

    static String dedupKey(String kind, long id, String visitorKey) {
        return DEDUP_PREFIX + kind + ":" + id + ":" + visitorKey;
    }

    static String dailyUvKey(String entityType, long id, java.time.LocalDate date, String visitorKey) {
        return DAILY_UV_PREFIX + entityType + ":" + id + ":" + date + ":" + visitorKey;
    }

    static Optional<String> resolveVisitorKey(String username, String sessionId) {
        if (username != null && !username.isBlank()) {
            return Optional.of("user:" + username.trim());
        }
        if (sessionId != null && !sessionId.isBlank()) {
            return Optional.of("anon:" + sessionId.trim());
        }
        return Optional.empty();
    }

    static Optional<PendingViewKey> parsePendingKey(String redisKey) {
        if (redisKey == null || !redisKey.startsWith(PENDING_PREFIX)) {
            return Optional.empty();
        }
        String suffix = redisKey.substring(PENDING_PREFIX.length());
        int colon = suffix.indexOf(':');
        if (colon <= 0 || colon >= suffix.length() - 1) {
            return Optional.empty();
        }
        String kind = suffix.substring(0, colon);
        if (!"brand".equals(kind) && !"model".equals(kind)) {
            return Optional.empty();
        }
        try {
            long id = Long.parseLong(suffix.substring(colon + 1));
            return Optional.of(new PendingViewKey(kind, id));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    record PendingViewKey(String kind, long id) {
    }
}
