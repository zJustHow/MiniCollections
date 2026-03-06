package com.zjusthow.minicollections.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BrandNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleBrandNotFoundException(BrandNotFoundException ex) {
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(BrandObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleBrandObjectNotFoundException(BrandObjectNotFoundException ex) {
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleUserNotFoundException(UserNotFoundException ex) {
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(GroupNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleGroupNotFoundException(GroupNotFoundException ex) {
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(UserObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleUserObjectNotFoundException(UserObjectNotFoundException ex) {
        return ex.getMessage() != null ? ex.getMessage() : "Not found";
    }

    @ExceptionHandler(EmailExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleEmailExistsException(EmailExistsException ex) {
        return ex.getMessage() != null ? ex.getMessage() : "Conflict";
    }

    @ExceptionHandler(NoPermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleNoPermissionException(NoPermissionException ex) {
        return ex.getMessage() != null ? ex.getMessage() : "Forbidden";
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage() != null ? err.getDefaultMessage() : "invalid"));
        return errors;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleIllegalArgumentException(IllegalArgumentException ex) {
        return ex.getMessage() != null ? ex.getMessage() : "Bad request";
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleAllExceptions(Exception ex) {
        return "Internal server error";
    }
}