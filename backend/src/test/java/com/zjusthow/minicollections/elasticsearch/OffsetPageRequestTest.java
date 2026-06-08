package com.zjusthow.minicollections.elasticsearch;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OffsetPageRequestTest {

    @Test
    void clampsNegativeOffsetAndZeroLimit() {
        OffsetPageRequest request = new OffsetPageRequest(-5, 0);
        assertEquals(0, request.getOffset());
        assertEquals(1, request.getPageSize());
    }

    @Test
    void pageNumberDerivedFromOffsetAndLimit() {
        OffsetPageRequest request = new OffsetPageRequest(48, 24);
        assertEquals(2, request.getPageNumber());
        assertEquals(24, request.getPageSize());
    }

    @Test
    void nextAndPreviousNavigateByLimit() {
        OffsetPageRequest first = new OffsetPageRequest(0, 24);
        OffsetPageRequest second = (OffsetPageRequest) first.next();
        assertEquals(24, second.getOffset());

        OffsetPageRequest back = (OffsetPageRequest) second.previousOrFirst();
        assertEquals(0, back.getOffset());
        assertEquals(first, second.previousOrFirst().previousOrFirst());
    }

    @Test
    void withPageRecalculatesOffset() {
        OffsetPageRequest request = new OffsetPageRequest(0, 10);
        OffsetPageRequest pageThree = (OffsetPageRequest) request.withPage(3);
        assertEquals(30, pageThree.getOffset());
    }

    @Test
    void hasPreviousReflectsOffset() {
        assertFalse(new OffsetPageRequest(0, 10).hasPrevious());
        assertTrue(new OffsetPageRequest(10, 10).hasPrevious());
    }
}
