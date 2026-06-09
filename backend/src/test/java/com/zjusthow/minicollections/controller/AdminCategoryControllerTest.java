package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.CategoryBody;
import com.zjusthow.minicollections.model.CategoryDto;
import com.zjusthow.minicollections.service.CategoryService;
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
class AdminCategoryControllerTest {

    @Mock CategoryService categoryService;
    @Mock DisplayLocaleResolver displayLocaleResolver;
    @Mock UserService userService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new AdminCategoryController(categoryService, displayLocaleResolver, userService))
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
    void createCategory_returnsCreated() throws Exception {
        CategoryBody body = new CategoryBody("custom-car", "Custom Car", "定制车", 23);
        CategoryDto created = new CategoryDto(23L, "custom-car", "Custom Car", "Custom Car", "定制车", 23);
        when(categoryService.create(body, "en-US")).thenReturn(created);

        mockMvc.perform(post("/admin/categories")
                        .with(authenticatedUser("1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("custom-car"));
    }

    @Test
    void updateCategory_returnsUpdated() throws Exception {
        CategoryBody body = new CategoryBody("custom-car", "Updated", "更新", 23);
        CategoryDto updated = new CategoryDto(23L, "custom-car", "Updated", "Updated", "更新", 23);
        when(categoryService.update(23L, body, "en-US")).thenReturn(updated);

        mockMvc.perform(put("/admin/categories/23")
                        .with(authenticatedUser("1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void deleteCategory_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/admin/categories/23"))
                .andExpect(status().isNoContent());

        verify(categoryService).delete(23L);
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
