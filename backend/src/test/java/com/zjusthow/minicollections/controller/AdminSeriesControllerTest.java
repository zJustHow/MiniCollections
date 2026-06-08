package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.SeriesBody;
import com.zjusthow.minicollections.model.SeriesDto;
import com.zjusthow.minicollections.service.SeriesService;
import com.zjusthow.minicollections.service.UserService;
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

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminSeriesControllerTest {

    @Mock SeriesService seriesService;
    @Mock DisplayLocaleResolver displayLocaleResolver;
    @Mock UserService userService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new AdminSeriesController(seriesService, displayLocaleResolver, userService))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();

        UserEntity admin = new UserEntity(1L, "Admin", "pwd", true, "en-US", null);
        lenient().when(userService.getUserById(1L)).thenReturn(admin);
        lenient().when(displayLocaleResolver.resolveEffectiveLocale(nullable(String.class), eq(admin)))
                .thenReturn("en-US");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createSeries_returnsCreated() throws Exception {
        SeriesBody body = new SeriesBody("GT Series", "GT系列");
        SeriesDto created = new SeriesDto(5L, 2L, "GT Series", "GT Series", "GT系列");
        when(seriesService.create(2L, body, "en-US")).thenReturn(created);

        mockMvc.perform(post("/admin/series/brands/2")
                        .with(authenticatedUser("1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nameEn").value("GT Series"));
    }

    @Test
    void updateSeries_returnsUpdated() throws Exception {
        SeriesBody body = new SeriesBody("Updated", null);
        SeriesDto updated = new SeriesDto(5L, 2L, "Updated", "Updated", null);
        when(seriesService.update(5L, body, "en-US")).thenReturn(updated);

        mockMvc.perform(put("/admin/series/5")
                        .with(authenticatedUser("1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void deleteSeries_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/admin/series/5"))
                .andExpect(status().isNoContent());

        verify(seriesService).delete(5L);
    }

    private static RequestPostProcessor authenticatedUser(String userId) {
        UserDetails user = org.springframework.security.core.userdetails.User
                .withUsername(userId)
                .password("n/a")
                .roles("ADMIN")
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
