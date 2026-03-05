package com.zjusthow.minicollections.exception;

public class BrandNotFoundException extends RuntimeException {
    public BrandNotFoundException() { super(); }
    public BrandNotFoundException(String message) { super(message);}
}
