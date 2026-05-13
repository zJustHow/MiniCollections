package com.zjusthow.minicollections.exception;

public class InvalidCodeException extends RuntimeException {
    private final String messageCode;

    public InvalidCodeException(String messageCode) {
        super(messageCode);
        this.messageCode = messageCode;
    }

    public String getMessageCode() { return messageCode; }
}
