package com.zjusthow.minicollections.exception;

public class IdentifierExistsException extends RuntimeException {
    public IdentifierExistsException() { super(); }
    public IdentifierExistsException(String message) { super(message); }
}
