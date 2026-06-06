package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.service.ImageStorageService;
import com.zjusthow.minicollections.service.UserService;
import com.zjusthow.minicollections.model.UserProfileDto;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/uploads")
@ConditionalOnBean(ImageStorageService.class)
public class ImageUploadController {

    private final ImageStorageService imageStorageService;
    private final UserService userService;

    public ImageUploadController(ImageStorageService imageStorageService, UserService userService) {
        this.imageStorageService = imageStorageService;
        this.userService = userService;
    }

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) throws IOException {
        long userId = Long.parseLong(user.getUsername());
        String url = imageStorageService.uploadUserImage(userId, file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/users/me/avatar")
    public ResponseEntity<UserProfileDto> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) throws IOException {
        long userId = Long.parseLong(user.getUsername());
        String url = imageStorageService.uploadUserImage(userId, file);
        UserProfileDto profile = userService.updateAvatarUrl(userId, url);
        return ResponseEntity.ok(profile);
    }

    /** Discards a user upload that was never saved (cancel / remove in UI). Idempotent. */
    @DeleteMapping("/image")
    public ResponseEntity<Void> deleteImage(
            @AuthenticationPrincipal User user,
            @RequestParam("url") String url) {
        long userId = Long.parseLong(user.getUsername());
        imageStorageService.deleteUserImageIfOwned(userId, url);
        return ResponseEntity.noContent().build();
    }
}
