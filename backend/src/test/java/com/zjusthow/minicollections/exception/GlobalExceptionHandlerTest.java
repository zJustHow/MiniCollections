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

    @Test
    void handleSeriesNotFoundException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleSeriesNotFoundException(new SeriesNotFoundException());

        assertEquals("error.series.not_found", response.code());
    }

    @Test
    void handleIdentifierExistsException_includesTypeArg() {
        ApiErrorResponse response = handler.handleIdentifierExistsException(
                new IdentifierExistsException("error.identifier_in_use", "email"));

        assertEquals("error.identifier_in_use", response.code());
        assertArrayEquals(new Object[]{"email"}, response.args());
    }

    @Test
    void handleSubmissionAlreadyReviewedException_returnsConflictCode() {
        ApiErrorResponse response = handler.handleSubmissionAlreadyReviewedException(
                new SubmissionAlreadyReviewedException());

        assertEquals("error.submission_reviewed", response.code());
    }

    @Test
    void handleNoSuchElementException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleNoSuchElementException(
                new java.util.NoSuchElementException("missing"));

        assertEquals("error.not_found", response.code());
    }

    @Test
    void handleCategoryNotFoundException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleCategoryNotFoundException(new CategoryNotFoundException());

        assertEquals("error.category.not_found", response.code());
    }

    @Test
    void handleBrandObjectNotFoundException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleBrandObjectNotFoundException(new BrandObjectNotFoundException());

        assertEquals("error.brand_object.not_found", response.code());
    }

    @Test
    void handleInvalidCodeException_returnsCodeFromException() {
        ApiErrorResponse response = handler.handleInvalidCodeException(
                new InvalidCodeException("error.invalid_code"));

        assertEquals("error.invalid_code", response.code());
    }

    @Test
    void handleUnsupportedImageTypeException_includesContentTypeArg() {
        ApiErrorResponse response = handler.handleUnsupportedImageTypeException(
                new UnsupportedImageTypeException("image/bmp"));

        assertEquals("error.unsupported_image_type", response.code());
        assertArrayEquals(new Object[]{"image/bmp"}, response.args());
    }

    @Test
    void handleScaleNotFoundException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleScaleNotFoundException(new ScaleNotFoundException());

        assertEquals("error.scale.not_found", response.code());
    }

    @Test
    void handleUserNotFoundException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleUserNotFoundException(new UserNotFoundException());

        assertEquals("error.user.not_found", response.code());
    }

    @Test
    void handleGroupNotFoundException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleGroupNotFoundException(new GroupNotFoundException());

        assertEquals("error.group.not_found", response.code());
    }

    @Test
    void handleRateLimitExceededException_returnsRateLimitCode() {
        ApiErrorResponse response = handler.handleRateLimitExceededException(
                new RateLimitExceededException());

        assertEquals("error.rate_limit_exceeded", response.code());
    }

    @Test
    void handleIllegalArgumentException_returnsBadRequestCode() {
        ApiErrorResponse response = handler.handleIllegalArgumentException(
                new IllegalArgumentException("bad input"));

        assertEquals("error.bad_request", response.code());
    }

    @Test
    void handleUserObjectNotFoundException_returnsNotFoundCode() {
        ApiErrorResponse response = handler.handleUserObjectNotFoundException(
                new UserObjectNotFoundException());

        assertEquals("error.user_object.not_found", response.code());
    }

    @Test
    void handleServiceNotConfiguredException_returnsInternalServerErrorCode() {
        ApiErrorResponse response = handler.handleServiceNotConfiguredException(
                new ServiceNotConfiguredException("Email service is not configured"));

        assertEquals("error.internal_server_error", response.code());
    }

    @Test
    void handleAllExceptions_returnsInternalServerErrorCode() {
        ApiErrorResponse response = handler.handleAllExceptions(new RuntimeException("boom"));

        assertEquals("error.internal_server_error", response.code());
    }
}
