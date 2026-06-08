package com.zjusthow.minicollections.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @BeforeEach
    void setUp() {
        String secret = Base64.getEncoder().encodeToString(
                "12345678901234567890123456789012".getBytes());
        ReflectionTestUtils.setField(jwtService, "secret", secret);
        ReflectionTestUtils.setField(jwtService, "expirationMs", 60_000L);
    }

    @Test
    void generateAndExtractSubject_roundTrip() {
        String token = jwtService.generate("42");
        assertEquals("42", jwtService.extractSubject(token));
        assertTrue(jwtService.isValid(token));
    }

    @Test
    void isValid_rejectsTamperedToken() {
        String token = jwtService.generate("42") + "x";
        assertFalse(jwtService.isValid(token));
    }
}
