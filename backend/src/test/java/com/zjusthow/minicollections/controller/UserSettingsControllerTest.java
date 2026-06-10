package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.model.AccountDeleteBody;
import com.zjusthow.minicollections.model.BrandCountDto;
import com.zjusthow.minicollections.model.CategoryCountDto;
import com.zjusthow.minicollections.model.CollectionStatsDto;
import com.zjusthow.minicollections.model.IdentifierUpdateBody;
import com.zjusthow.minicollections.model.PasswordUpdateBody;
import com.zjusthow.minicollections.model.PurchaseTrendPointDto;
import com.zjusthow.minicollections.model.UserLocaleBody;
import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.model.UserProfileUpdateBody;
import com.zjusthow.minicollections.service.CollectionStatsService;
import com.zjusthow.minicollections.service.UserService;
import com.zjusthow.minicollections.service.VerificationService;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserSettingsControllerTest {

    @Mock UserService userService;
    @Mock VerificationService verificationService;
    @Mock CollectionStatsService collectionStatsService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new UserSettingsController(userService, verificationService, collectionStatsService))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getMe_returnsProfile() throws Exception {
        UserProfileDto profile = new UserProfileDto(
                5L, "alice@example.com", null, "Alice", "en-US", null, false, false, true);
        when(userService.getProfile(5L)).thenReturn(profile);

        mockMvc.perform(get("/users/me").with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Alice"));
    }

    @Test
    void updateProfile_updatesDisplayName() throws Exception {
        UserProfileDto updated = new UserProfileDto(
                5L, "alice@example.com", null, "Alice Updated", "en-US", null, false, false, true);
        when(userService.updateDisplayName(5L, "Alice Updated")).thenReturn(updated);

        UserProfileUpdateBody body = new UserProfileUpdateBody("Alice Updated");

        mockMvc.perform(patch("/users/me")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Alice Updated"));
    }

    @Test
    void updatePassword_changesPassword() throws Exception {
        UserProfileDto profile = new UserProfileDto(
                5L, "alice@example.com", null, "Alice", "en-US", null, false, false, true);
        when(userService.updatePassword(5L, "oldpass", "newpass1")).thenReturn(profile);

        PasswordUpdateBody body = new PasswordUpdateBody("oldpass", "newpass1");

        mockMvc.perform(patch("/users/me/password")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());

        verify(userService).updatePassword(5L, "oldpass", "newpass1");
    }

    @Test
    void updateLocale_savesPreferredLocale() throws Exception {
        UserProfileDto profile = new UserProfileDto(
                5L, "alice@example.com", null, "Alice", "zh-CN", null, false, false, true);
        when(userService.updatePreferredLocale(5L, "zh-CN")).thenReturn(profile);

        UserLocaleBody body = new UserLocaleBody("zh-CN");

        mockMvc.perform(patch("/users/me/locale")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredLocale").value("zh-CN"));
    }

    @Test
    void getCollectionStats_returnsAggregatedStats() throws Exception {
        CollectionStatsDto stats = new CollectionStatsDto(
                12L,
                List.of(new CategoryCountDto(1L, "Race Car", "赛车", 5L)),
                List.of(new BrandCountDto(2L, "Mini GT", "Mini GT", 3L)),
                List.of(new PurchaseTrendPointDto(
                        java.time.LocalDate.of(2024, 1, 1),
                        new java.math.BigDecimal("100.00"),
                        new java.math.BigDecimal("100.00"))));
        when(collectionStatsService.getStats(5L)).thenReturn(stats);

        mockMvc.perform(get("/users/me/collection-stats").with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalObjects").value(12))
                .andExpect(jsonPath("$.byCategory[0].nameEn").value("Race Car"))
                .andExpect(jsonPath("$.byBrand[0].count").value(3))
                .andExpect(jsonPath("$.purchaseTrend[0].cumulativeTotal").value(100.00));
    }

    @Test
    void updateIdentifier_verifiesCodeThenUpdates() throws Exception {
        UserProfileDto profile = new UserProfileDto(
                5L, "new@example.com", null, "Alice", "en-US", null, false, false, true);
        when(userService.updateIdentifier(5L, "email", "new@example.com")).thenReturn(profile);

        IdentifierUpdateBody body = new IdentifierUpdateBody("email", "new@example.com", "123456");

        mockMvc.perform(patch("/users/me/identifier")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@example.com"));

        verify(verificationService).verify("new@example.com", "123456");
        verify(userService).updateIdentifier(5L, "email", "new@example.com");
    }

    @Test
    void deleteAccount_deletesCurrentUser() throws Exception {
        AccountDeleteBody body = new AccountDeleteBody("secret");

        mockMvc.perform(delete("/users/me")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNoContent());

        verify(userService).deleteAccount(5L, "secret");
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
