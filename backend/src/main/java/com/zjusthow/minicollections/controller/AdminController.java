package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.ApprovalBody;
import com.zjusthow.minicollections.model.ObjectSubmissionDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.RejectionBody;
import com.zjusthow.minicollections.model.SubmissionStatusCounts;
import com.zjusthow.minicollections.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final SubmissionService submissionService;

    public AdminController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @GetMapping("/submissions/counts")
    public ResponseEntity<SubmissionStatusCounts> submissionCounts() {
        return ResponseEntity.ok(submissionService.getStatusCounts());
    }

    @GetMapping("/submissions")
    public ResponseEntity<PageResponse<ObjectSubmissionDto>> listSubmissions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size) {
        return ResponseEntity.ok(submissionService.listByStatusPage(status, page, size));
    }

    @PostMapping("/submissions/{id}/approve")
    public ResponseEntity<ObjectSubmissionDto> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody @Valid ApprovalBody body) {
        Long adminId = Long.parseLong(user.getUsername());
        return ResponseEntity.ok(submissionService.approve(id, adminId, body));
    }

    @PostMapping("/submissions/{id}/reject")
    public ResponseEntity<ObjectSubmissionDto> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) RejectionBody body) {
        Long adminId = Long.parseLong(user.getUsername());
        return ResponseEntity.ok(submissionService.reject(id, adminId, body != null ? body.reason() : null));
    }
}
