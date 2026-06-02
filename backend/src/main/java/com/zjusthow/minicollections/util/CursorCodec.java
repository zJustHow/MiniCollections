package com.zjusthow.minicollections.util;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

public final class CursorCodec {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private CursorCodec() {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CursorPayload(String t, Long id, List<Object> sort) {
    }

    public static String encodeSql(long id) {
        return encode(new CursorPayload("sql", id, null));
    }

    public static Long decodeSql(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        CursorPayload payload = decode(token);
        if (!"sql".equals(payload.t()) || payload.id() == null) {
            throw new IllegalArgumentException("Invalid SQL cursor");
        }
        return payload.id();
    }

    public static boolean isSqlCursor(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return "sql".equals(decode(token).t());
    }

    public static String encodeEs(List<Object> sortValues) {
        if (sortValues == null || sortValues.isEmpty()) {
            throw new IllegalArgumentException("Missing ES sort values");
        }
        return encode(new CursorPayload("es", null, sortValues));
    }

    public static List<Object> decodeEs(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        CursorPayload payload = decode(token);
        if (!"es".equals(payload.t()) || payload.sort() == null || payload.sort().isEmpty()) {
            throw new IllegalArgumentException("Invalid ES cursor");
        }
        return payload.sort();
    }

    public static boolean isEsCursor(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return "es".equals(decode(token).t());
    }

    private static String encode(CursorPayload payload) {
        try {
            byte[] bytes = MAPPER.writeValueAsBytes(payload);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to encode cursor", e);
        }
    }

    private static CursorPayload decode(String token) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(token);
            return MAPPER.readValue(bytes, CursorPayload.class);
        } catch (IOException | IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid cursor", e);
        }
    }
}
