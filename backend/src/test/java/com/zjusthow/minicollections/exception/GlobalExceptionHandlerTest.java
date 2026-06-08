package com.zjusthow.minicollections.exception;

import com.zjusthow.minicollections.model.ApiErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleLimitExceededException_includesArgs() {
        ApiErrorResponse response = handler.handleLimitExceededException(
                new LimitExceededException("error.group.limit", 5));

        assertEquals("error.group.limit", response.code());
        assertArrayEquals(new Object[]{5}, response.args());
    }

    @Test
    void handleValidationException_passesCode() {
        ApiErrorResponse response = handler.handleValidationException(
                new ValidationException("error.email_or_phone_required"));

        assertEquals("error.email_or_phone_required", response.code());
    }

    @Test
    void handleBadCredentialsException_mapsPasswordIncorrect() {
        ApiErrorResponse response = handler.handleBadCredentialsException(
                new BadCredentialsException("error.password_incorrect"));

        assertEquals("error.password_incorrect", response.code());
    }

    @Test
    void handleBadCredentialsException_fallsBackToGenericCode() {
        ApiErrorResponse response = handler.handleBadCredentialsException(
                new BadCredentialsException("Bad credentials"));

        assertEquals("error.bad_credentials", response.code());
    }

    @Test
    void handleIllegalStateException_returnsConflictCode() {
        ApiErrorResponse response = handler.handleIllegalStateException(
                new IllegalStateException("Cannot revoke the last admin"));

        assertEquals("error.conflict", response.code());
    }

    @Test
    void handleMethodArgumentNotValidException_returnsValidationFailed() {
        var ex = mock(org.springframework.web.bind.MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        org.mockito.Mockito.when(ex.getBindingResult()).thenReturn(bindingResult);

        ApiErrorResponse response = handler.handleMethodArgumentNotValidException(ex);

        assertEquals("error.validation_failed", response.code());
    }

    @Test
    void handleBrandNotFoundException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleBrandNotFoundException(new BrandNotFoundException());

        assertEquals("error.brand.not_found", response.code());
    }

    @Test
    void handleNoPermissionException_returnsForbiddenCode() {
        ApiErrorResponse response = handler.handleNoPermissionException(
                new NoPermissionException("denied"));

        assertEquals("error.no_permission", response.code());
    }

    @Test
    void handleTooManyRequestsException_returnsRateLimitCode() {
        ApiErrorResponse response = handler.handleTooManyRequestsException(
                new TooManyRequestsException("error.too_many_requests"));

        assertEquals("error.too_many_requests", response.code());
    }
}
