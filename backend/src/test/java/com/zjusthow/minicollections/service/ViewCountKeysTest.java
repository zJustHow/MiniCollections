package com.zjusthow.minicollections.service;

import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ViewCountKeysTest {

    @Test
    void resolveVisitorKey_prefersLoggedInUser() {
        Optional<String> key = ViewCountKeys.resolveVisitorKey("alice@example.com", "session-1");
        assertEquals(Optional.of("user:alice@example.com"), key);
    }

    @Test
    void resolveVisitorKey_fallsBackToAnonymousSession() {
        Optional<String> key = ViewCountKeys.resolveVisitorKey(null, "session-1");
        assertEquals(Optional.of("anon:session-1"), key);
    }

    @Test
    void resolveVisitorKey_emptyWhenNoIdentity() {
        assertTrue(ViewCountKeys.resolveVisitorKey(null, null).isEmpty());
        assertTrue(ViewCountKeys.resolveVisitorKey("  ", "  ").isEmpty());
    }

    @Test
    void entityType_mapsKindToDatabaseValue() {
        assertEquals("BRAND", ViewCountKeys.entityType("brand"));
        assertEquals("MODEL", ViewCountKeys.entityType("model"));
    }

    @Test
    void parsePendingKey_readsBrandAndModelKeys() {
        assertEquals(
                Optional.of(new ViewCountKeys.PendingViewKey("brand", 5L)),
                ViewCountKeys.parsePendingKey("views:pending:brand:5"));
        assertEquals(
                Optional.of(new ViewCountKeys.PendingViewKey("model", 99L)),
                ViewCountKeys.parsePendingKey("views:pending:model:99"));
    }

    @Test
    void parsePendingKey_rejectsInvalidKeys() {
        assertTrue(ViewCountKeys.parsePendingKey("views:dedup:brand:5").isEmpty());
        assertTrue(ViewCountKeys.parsePendingKey("views:pending:other:5").isEmpty());
        assertTrue(ViewCountKeys.parsePendingKey("views:pending:brand:not-a-number").isEmpty());
    }
}
