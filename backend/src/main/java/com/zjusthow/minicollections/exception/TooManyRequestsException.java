package com.zjusthow.minicollections.exception;

public class TooManyRequestsException extends RuntimeException {
    private final String messageCode;

    public TooManyRequestsException(String messageCode) {
        super(messageCode);
        this.messageCode = messageCode;
    }

    public String getMessageCode() { return messageCode; }
}
