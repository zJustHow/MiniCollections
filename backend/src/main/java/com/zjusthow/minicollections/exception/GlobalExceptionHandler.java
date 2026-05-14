package com.zjusthow.minicollections.exception;

import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final MessageSource messageSource;
    private final DisplayLocaleResolver displayLocaleResolver;

    public GlobalExceptionHandler(
            MessageSource messageSource,
            DisplayLocaleResolver displayLocaleResolver) {
        this.messageSource = messageSource;
        this.displayLocaleResolver = displayLocaleResolver;
    }

    private Locale locale(String acceptLanguage, User user) {
        String tag = displayLocaleResolver.resolveEffectiveLocale(acceptLanguage, user);
        return Locale.forLanguageTag(tag);
    }

    private String msg(String key, String lang, User user, Object... args) {
        return messageSource.getMessage(key, args.length > 0 ? args : null, locale(lang, user));
    }

    @ExceptionHandler(BrandNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleBrandNotFoundException(
            BrandNotFoundException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("Brand not found");
        return msg("error.brand.not_found", lang, user);
    }

    @ExceptionHandler(BrandObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleBrandObjectNotFoundException(
            BrandObjectNotFoundException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("Brand object not found");
        return msg("error.brand_object.not_found", lang, user);
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleUserNotFoundException(
            UserNotFoundException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("User not found");
        return msg("error.user.not_found", lang, user);
    }

    @ExceptionHandler(GroupNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleGroupNotFoundException(
            GroupNotFoundException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("Group not found");
        return msg("error.group.not_found", lang, user);
    }

    @ExceptionHandler(UserObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleUserObjectNotFoundException(
            UserObjectNotFoundException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("User object not found");
        return msg("error.user_object.not_found", lang, user);
    }

    @ExceptionHandler(IdentifierExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleIdentifierExistsException(
            IdentifierExistsException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.warn("Identifier exists: {}", ex.getMessageCode());
        return messageSource.getMessage(ex.getMessageCode(), ex.getArgs(), locale(lang, user));
    }

    @ExceptionHandler(NoPermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleNoPermissionException(
            NoPermissionException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.warn("Forbidden: {}", ex.getMessage());
        return msg("error.no_permission", lang, user);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationException(MethodArgumentNotValidException ex) {
        log.debug("Validation failed: {}", ex.getBindingResult().getFieldErrors());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage() != null ? err.getDefaultMessage() : "invalid"));
        return errors;
    }

    @ExceptionHandler(InvalidCodeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleInvalidCodeException(
            InvalidCodeException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("Invalid code: {}", ex.getMessageCode());
        return msg(ex.getMessageCode(), lang, user);
    }

    @ExceptionHandler(LimitExceededException.class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public String handleLimitExceededException(
            LimitExceededException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("Limit exceeded: {}", ex.getMessageCode());
        return messageSource.getMessage(ex.getMessageCode(), ex.getArgs(), locale(lang, user));
    }

    @ExceptionHandler(TooManyRequestsException.class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public String handleTooManyRequestsException(
            TooManyRequestsException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("Rate limited: {}", ex.getMessageCode());
        return msg(ex.getMessageCode(), lang, user);
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public String handleBadCredentialsException(
            BadCredentialsException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        String key = "error.password_incorrect".equals(ex.getMessage())
                ? "error.password_incorrect"
                : "error.bad_credentials";
        return msg(key, lang, user);
    }

    @ExceptionHandler(SubmissionAlreadyReviewedException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleSubmissionAlreadyReviewedException(
            SubmissionAlreadyReviewedException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("Submission already reviewed");
        return msg("error.submission_reviewed", lang, user);
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleValidationException(ValidationException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        return ex.getMessage();
    }

    @ExceptionHandler(UnsupportedImageTypeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleUnsupportedImageTypeException(UnsupportedImageTypeException ex) {
        log.warn("Unsupported image type: {}", ex.getMessage());
        return ex.getMessage();
    }

    @ExceptionHandler(ServiceNotConfiguredException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleServiceNotConfiguredException(ServiceNotConfiguredException ex) {
        log.error("Service not configured: {}", ex.getMessage());
        return "Internal server error";
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Bad request";
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleIllegalStateException(IllegalStateException ex) {
        log.warn("Conflict: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Conflict";
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleNoSuchElementException(
            java.util.NoSuchElementException ex,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang,
            @AuthenticationPrincipal User user) {
        log.debug("Not found: {}", ex.getMessage());
        return msg("error.not_found", lang, user);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleAllExceptions(Exception ex) {
        log.error("Unhandled exception: {} - {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        return "Internal server error";
    }
}
