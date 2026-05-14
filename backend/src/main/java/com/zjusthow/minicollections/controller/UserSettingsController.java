package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.*;
import com.zjusthow.minicollections.service.UserService;
import com.zjusthow.minicollections.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserSettingsController {

    private final UserService userService;
    private final VerificationService verificationService;

    public UserSettingsController(UserService userService, VerificationService verificationService) {
        this.userService = userService;
        this.verificationService = verificationService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMe(@AuthenticationPrincipal User user) {
        Long userId = Long.parseLong(user.getUsername());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid UserProfileUpdateBody body) {
        Long userId = Long.parseLong(user.getUsername());
        return ResponseEntity.ok(userService.updateDisplayName(userId, body.displayName()));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<UserProfileDto> updatePassword(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid PasswordUpdateBody body) {
        Long userId = Long.parseLong(user.getUsername());
        return ResponseEntity.ok(userService.updatePassword(userId, body.currentPassword(), body.newPassword()));
    }

    @PatchMapping("/me/identifier")
    public ResponseEntity<UserProfileDto> updateIdentifier(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid IdentifierUpdateBody body) {
        Long userId = Long.parseLong(user.getUsername());
        verificationService.verify(body.identifier(), body.code());
        return ResponseEntity.ok(userService.updateIdentifier(userId, body.type(), body.identifier()));
    }

    @PatchMapping("/me/locale")
    public ResponseEntity<UserProfileDto> updateLocale(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid UserLocaleBody body) {
        Long userId = Long.parseLong(user.getUsername());
        return ResponseEntity.ok(userService.updatePreferredLocale(userId, body.preferredLocale()));
    }
}
