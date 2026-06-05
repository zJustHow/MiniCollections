package com.zjusthow.minicollections.model;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean totalExact
) {
    public static <T> PageResponse<T> of(
            List<T> content,
            int page,
            int size,
            long totalElements,
            boolean totalExact) {
        int totalPages = size <= 0 ? 0 : (int) Math.ceil((double) totalElements / size);
        return new PageResponse<>(content, page, size, totalElements, totalPages, totalExact);
    }

    public static <T> PageResponse<T> empty(int page, int size) {
        return of(List.of(), page, size, 0L, true);
    }
}
