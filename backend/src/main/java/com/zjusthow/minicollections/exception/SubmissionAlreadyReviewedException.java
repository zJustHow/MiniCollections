package com.zjusthow.minicollections.exception;

public class SubmissionAlreadyReviewedException extends RuntimeException {
    public SubmissionAlreadyReviewedException() {
        super("error.submission_reviewed");
    }
}
