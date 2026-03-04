package com.zjusthow.minicollections.exception;

public class GroupNotFoundException extends RuntimeException {
    public GroupNotFoundException() { super(); }
    public GroupNotFoundException(String message) {
        super(message);
    }
}
