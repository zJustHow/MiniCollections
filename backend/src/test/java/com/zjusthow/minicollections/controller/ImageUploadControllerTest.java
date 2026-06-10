package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.service.ImageStorageService;
import com.zjusthow.minicollections.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ImageUploadControllerTest {

    @Mock ImageStorageService imageStorageService;
    @Mock UserService userService;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ImageUploadController(imageStorageService, userService))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void uploadImage_returnsPublicUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.png", "image/png", new byte[] {1, 2});
        when(imageStorageService.uploadUserImage(eq(5L), org.mockito.ArgumentMatchers.any()))
                .thenReturn("https://cdn.example.com/u/photo.png");

        mockMvc.perform(multipart("/uploads/image")
                        .file(file)
                        .with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://cdn.example.com/u/photo.png"));
    }

    @Test
    void uploadAvatar_updatesProfile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", new byte[] {3, 4});
        UserProfileDto profile = new UserProfileDto(
                5L, "alice@example.com", null, "Alice", "en-US", "avatar.png", false, false, true);
        when(imageStorageService.uploadUserImage(eq(5L), org.mockito.ArgumentMatchers.any()))
                .thenReturn("avatar.png");
        when(userService.updateAvatarUrl(5L, "avatar.png")).thenReturn(profile);

        mockMvc.perform(multipart("/uploads/users/me/avatar")
                        .file(file)
                        .with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("avatar.png"));
    }

    @Test
    void deleteImage_discardsOwnedUpload() throws Exception {
        mockMvc.perform(delete("/uploads/image")
                        .param("url", "https://cdn.example.com/u/old.png")
                        .with(authenticatedUser("5")))
                .andExpect(status().isNoContent());

        verify(imageStorageService).deleteUserImageIfOwned(5L, "https://cdn.example.com/u/old.png");
    }

    private static RequestPostProcessor authenticatedUser(String userId) {
        UserDetails user = org.springframework.security.core.userdetails.User
                .withUsername(userId)
                .password("n/a")
                .roles("USER")
                .build();
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        return request -> {
            SecurityContextHolder.getContext().setAuthentication(authentication);
            request.setUserPrincipal(authentication);
            return request;
        };
    }
}
