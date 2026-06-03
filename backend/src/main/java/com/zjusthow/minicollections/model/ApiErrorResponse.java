package com.zjusthow.minicollections.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(String code, Object[] args) {

    public static ApiErrorResponse of(String code, Object... args) {
        return new ApiErrorResponse(code, args.length > 0 ? args : null);
    }
}
