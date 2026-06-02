package com.zjusthow.minicollections.storage;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserStorageKeysTest {

    @Test
    void acceptsUserUploadKey() {
        String key = "42/a1b2c3d4-e5f6-4789-abcd-ef0123456789.jpg";
        assertTrue(UserStorageKeys.isUserUploadKey(key));
        assertTrue(UserStorageKeys.isOwnedByUser(42, key));
        assertFalse(UserStorageKeys.isOwnedByUser(43, key));
    }

    @Test
    void rejectsBrandAndCatalogKeys() {
        assertFalse(UserStorageKeys.isUserUploadKey("brands/minigt/logo.svg"));
        assertFalse(UserStorageKeys.isUserUploadKey("minigt/12345.jpg"));
        assertFalse(UserStorageKeys.isUserUploadKey("42/not-a-uuid.jpg"));
    }
}
