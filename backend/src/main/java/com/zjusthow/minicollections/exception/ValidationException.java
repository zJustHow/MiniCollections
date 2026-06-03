package com.zjusthow.minicollections.exception;

public class ValidationException extends RuntimeException {
    private final String messageCode;
    private final Object[] args;

    public ValidationException(String messageCode, Object... args) {
        super(messageCode);
        this.messageCode = messageCode;
        this.args = args;
    }

    public String getMessageCode() { return messageCode; }
    public Object[] getArgs() { return args; }
}
