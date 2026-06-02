package com.zjusthow.minicollections.model;

import java.util.List;

public record SliceResponse<T>(
        List<T> content,
        int size,
        boolean hasMore,
        String nextCursor,
        Long totalElements,
        Boolean totalExact
) {
    public static <T> SliceResponse<T> of(
            List<T> content,
            int size,
            boolean hasMore,
            String nextCursor,
            Long totalElements,
            Boolean totalExact) {
        return new SliceResponse<>(content, size, hasMore, nextCursor, totalElements, totalExact);
    }

    public static <T> SliceResponse<T> ofList(List<T> content, int size, boolean hasMore, String nextCursor) {
        return new SliceResponse<>(content, size, hasMore, nextCursor, null, null);
    }
}
