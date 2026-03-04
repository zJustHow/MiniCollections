package com.zjusthow.minicollections.model;

public record RegisterBody(
        String email,
        String password,
        String name
) {
}
