package com.zjusthow.minicollections.storage;

import java.util.regex.Pattern;

/**
 * Object keys for user-uploaded images ({@code {userId}/{uuid}.ext}).
 */
public final class UserStorageKeys {

    private static final Pattern USER_UPLOAD_KEY = Pattern.compile(
            "^\\d+/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(jpg|jpeg|png|webp|gif|svg)$",
            Pattern.CASE_INSENSITIVE);

    private UserStorageKeys() {
    }

    public static boolean isUserUploadKey(String key) {
        return key != null && USER_UPLOAD_KEY.matcher(key).matches();
    }

    public static boolean isOwnedByUser(long userId, String key) {
        return isUserUploadKey(key) && key.startsWith(userId + "/");
    }
}
