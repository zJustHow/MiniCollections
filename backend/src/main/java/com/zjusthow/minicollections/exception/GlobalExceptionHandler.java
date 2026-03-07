package com.zjusthow.minicollections.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BrandNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleBrandNotFoundException(BrandNotFoundException ex) {
        log.debug("Brand not found: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(BrandObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleBrandObjectNotFoundException(BrandObjectNotFoundException ex) {
        log.debug("Brand object not found: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleUserNotFoundException(UserNotFoundException ex) {
        log.debug("User not found: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(GroupNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleGroupNotFoundException(GroupNotFoundException ex) {
        log.debug("Group not found: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(UserObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleUserObjectNotFoundException(UserObjectNotFoundException ex) {
        log.debug("User object not found: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(EmailExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleEmailExistsException(EmailExistsException ex) {
        log.warn("Registration conflict (email exists): {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Conflict";
    }

    @ExceptionHandler(NoPermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleNoPermissionException(NoPermissionException ex) {
        log.warn("Forbidden: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Forbidden";
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

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ex.getMessage() != null ? ex.getMessage() : "Bad request";
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleAllExceptions(Exception ex) {
        log.error("Unhandled exception: {} - {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        return "Internal server error";
    }
}