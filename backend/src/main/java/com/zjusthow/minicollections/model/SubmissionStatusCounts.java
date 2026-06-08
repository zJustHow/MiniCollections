package com.zjusthow.minicollections.model;

public record SubmissionStatusCounts(
        long pending,
        long approved,
        long rejected,
        long total
) {}
