package com.zjusthow.minicollections.storage;

import java.net.URI;
import java.util.Optional;

/**
 * Resolves S3 object keys from public URLs returned by {@link com.zjusthow.minicollections.service.ImageStorageService}.
 */
public final class StoredObjectUrls {

    private StoredObjectUrls() {
    }

    public static Optional<String> objectKeyFromPublicUrl(String publicBaseUrl, String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank() || publicBaseUrl == null || publicBaseUrl.isBlank()) {
            return Optional.empty();
        }
        String base = publicBaseUrl.replaceAll("/+$", "");
        String normalized = imageUrl.strip();
        int query = normalized.indexOf('?');
        if (query >= 0) {
            normalized = normalized.substring(0, query);
        }
        if (normalized.startsWith(base + "/")) {
            String key = normalized.substring(base.length() + 1);
            return key.isBlank() ? Optional.empty() : Optional.of(key);
        }
        try {
            URI uri = URI.create(normalized);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                return Optional.empty();
            }
            String basePath = URI.create(base).getPath();
            if (basePath == null || basePath.isBlank()) {
                return Optional.empty();
            }
            if (!path.startsWith(basePath + "/")) {
                return Optional.empty();
            }
            String key = path.substring(basePath.length() + 1);
            return key.isBlank() ? Optional.empty() : Optional.of(key);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
