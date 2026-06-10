package com.zjusthow.minicollections.exception;

import com.zjusthow.minicollections.model.ApiErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BrandNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleBrandNotFoundException(BrandNotFoundException ex) {
        log.debug("Brand not found");
        return ApiErrorResponse.of("error.brand.not_found");
    }

    @ExceptionHandler(SeriesNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleSeriesNotFoundException(SeriesNotFoundException ex) {
        log.debug("Series not found");
        return ApiErrorResponse.of("error.series.not_found");
    }

    @ExceptionHandler(CategoryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleCategoryNotFoundException(CategoryNotFoundException ex) {
        log.debug("Category not found");
        return ApiErrorResponse.of("error.category.not_found");
    }

    @ExceptionHandler(ScaleNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleScaleNotFoundException(ScaleNotFoundException ex) {
        log.debug("Scale not found");
        return ApiErrorResponse.of("error.scale.not_found");
    }

    @ExceptionHandler(BrandObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleBrandObjectNotFoundException(BrandObjectNotFoundException ex) {
        log.debug("Brand object not found");
        return ApiErrorResponse.of("error.brand_object.not_found");
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleUserNotFoundException(UserNotFoundException ex) {
        log.debug("User not found");
        return ApiErrorResponse.of("error.user.not_found");
    }

    @ExceptionHandler(GroupNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleGroupNotFoundException(GroupNotFoundException ex) {
        log.debug("Group not found");
        return ApiErrorResponse.of("error.group.not_found");
    }

    @ExceptionHandler(UserObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleUserObjectNotFoundException(UserObjectNotFoundException ex) {
        log.debug("User object not found");
        return ApiErrorResponse.of("error.user_object.not_found");
    }

    @ExceptionHandler(IdentifierExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleIdentifierExistsException(IdentifierExistsException ex) {
        log.warn("Identifier exists: {}", ex.getMessageCode());
        return ApiErrorResponse.of(ex.getMessageCode(), ex.getArgs());
    }

    @ExceptionHandler(NoPermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiErrorResponse handleNoPermissionException(NoPermissionException ex) {
        log.warn("Forbidden: {}", ex.getMessage());
        return ApiErrorResponse.of("error.no_permission");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        log.debug("Validation failed: {}", ex.getBindingResult().getFieldErrors());
        return ApiErrorResponse.of("error.validation_failed");
    }

    @ExceptionHandler(InvalidCodeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleInvalidCodeException(InvalidCodeException ex) {
        log.debug("Invalid code: {}", ex.getMessageCode());
        return ApiErrorResponse.of(ex.getMessageCode());
    }

    @ExceptionHandler(LimitExceededException.class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public ApiErrorResponse handleLimitExceededException(LimitExceededException ex) {
        log.debug("Limit exceeded: {}", ex.getMessageCode());
        return ApiErrorResponse.of(ex.getMessageCode(), ex.getArgs());
    }

    @ExceptionHandler(TooManyRequestsException.class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public ApiErrorResponse handleTooManyRequestsException(TooManyRequestsException ex) {
        log.debug("Rate limited: {}", ex.getMessageCode());
        return ApiErrorResponse.of(ex.getMessageCode());
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiErrorResponse handleBadCredentialsException(BadCredentialsException ex) {
        String code = "error.password_incorrect".equals(ex.getMessage())
                ? "error.password_incorrect"
                : "error.bad_credentials";
        return ApiErrorResponse.of(code);
    }

    @ExceptionHandler(SubmissionAlreadyReviewedException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleSubmissionAlreadyReviewedException(SubmissionAlreadyReviewedException ex) {
        log.debug("Submission already reviewed");
        return ApiErrorResponse.of("error.submission_reviewed");
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleValidationException(ValidationException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        return ApiErrorResponse.of(ex.getMessageCode(), ex.getArgs());
    }

    @ExceptionHandler(UnsupportedImageTypeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleUnsupportedImageTypeException(UnsupportedImageTypeException ex) {
        log.warn("Unsupported image type: {}", ex.getContentType());
        return ApiErrorResponse.of("error.unsupported_image_type", ex.getContentType());
    }

    @ExceptionHandler(ServiceNotConfiguredException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponse handleServiceNotConfiguredException(ServiceNotConfiguredException ex) {
        log.error("Service not configured: {}", ex.getMessage());
        return ApiErrorResponse.of("error.internal_server_error");
    }

    @ExceptionHandler(RateLimitExceededException.class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public ApiErrorResponse handleRateLimitExceededException(RateLimitExceededException ex) {
        log.debug("View count rate limit exceeded");
        return ApiErrorResponse.of("error.rate_limit_exceeded");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ApiErrorResponse.of("error.bad_request");
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleIllegalStateException(IllegalStateException ex) {
        log.warn("Conflict: {}", ex.getMessage());
        return ApiErrorResponse.of("error.conflict");
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleNoSuchElementException(java.util.NoSuchElementException ex) {
        log.debug("Not found: {}", ex.getMessage());
        return ApiErrorResponse.of("error.not_found");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponse handleAllExceptions(Exception ex) {
        log.error("Unhandled exception: {} - {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        return ApiErrorResponse.of("error.internal_server_error");
    }
}
