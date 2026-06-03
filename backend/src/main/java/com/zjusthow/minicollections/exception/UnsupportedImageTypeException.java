package com.zjusthow.minicollections.exception;

public class UnsupportedImageTypeException extends RuntimeException {
    private final String contentType;

    public UnsupportedImageTypeException(String contentType) {
        super("Unsupported image type: " + contentType);
        this.contentType = contentType;
    }

    public String getContentType() { return contentType; }
}
