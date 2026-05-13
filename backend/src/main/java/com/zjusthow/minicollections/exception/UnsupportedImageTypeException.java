package com.zjusthow.minicollections.exception;

public class UnsupportedImageTypeException extends RuntimeException {
    public UnsupportedImageTypeException(String contentType) {
        super("Unsupported image type: " + contentType);
    }
}
