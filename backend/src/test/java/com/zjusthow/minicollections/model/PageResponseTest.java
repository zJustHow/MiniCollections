package com.zjusthow.minicollections.model;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PageResponseTest {

    @Test
    void of_calculatesTotalPages() {
        PageResponse<String> response = PageResponse.of(List.of("a", "b"), 0, 24, 50, true);

        assertEquals(3, response.totalPages());
        assertEquals(50L, response.totalElements());
        assertEquals(24, response.size());
        assertTrue(response.totalExact());
    }

    @Test
    void of_returnsZeroPagesWhenSizeNonPositive() {
        PageResponse<String> response = PageResponse.of(List.of("a"), 0, 0, 10, true);
        assertEquals(0, response.totalPages());
    }

    @Test
    void empty_returnsZeroTotal() {
        PageResponse<String> response = PageResponse.empty(2, 24);

        assertEquals(List.of(), response.content());
        assertEquals(2, response.page());
        assertEquals(0L, response.totalElements());
        assertEquals(0, response.totalPages());
    }
}
