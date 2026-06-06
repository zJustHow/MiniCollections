package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.ObjectSubmissionDto;
import com.zjusthow.minicollections.model.SubmissionBody;
import com.zjusthow.minicollections.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @GetMapping("/submissions/mine")
    public ResponseEntity<List<ObjectSubmissionDto>> getMySubmissions(
            @AuthenticationPrincipal User user) {
        Long userId = Long.parseLong(user.getUsername());
        return ResponseEntity.ok(submissionService.listByUser(userId));
    }

    @PostMapping("/submissions")
    public ResponseEntity<ObjectSubmissionDto> submit(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid SubmissionBody body) {
        Long userId = Long.parseLong(user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submit(userId, body));
    }

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<Void> deleteMySubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        Long userId = Long.parseLong(user.getUsername());
        submissionService.deleteByUser(userId, id);
        return ResponseEntity.noContent().build();
    }
}
