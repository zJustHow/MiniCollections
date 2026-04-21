package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.UserLocaleBody;
import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserSettingsController {

    private final UserService userService;

    public UserSettingsController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user.getUsername()));
    }

    @PatchMapping("/me/locale")
    public ResponseEntity<UserProfileDto> updateLocale(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid UserLocaleBody body) {
        return ResponseEntity.ok(userService.updatePreferredLocale(user.getUsername(), body.preferredLocale()));
    }
}
