package com.zjusthow.minicollections.image;

public record NormalizedBrandLogo(byte[] bytes, String contentType) {

    public static NormalizedBrandLogo unchanged(byte[] bytes, String contentType) {
        return new NormalizedBrandLogo(bytes, contentType);
    }
}
