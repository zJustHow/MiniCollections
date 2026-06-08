package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandBody;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectBody;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.service.BrandService;
import com.zjusthow.minicollections.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
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
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminBrandControllerTest {

    @Mock BrandService brandService;
    @Mock DisplayLocaleResolver displayLocaleResolver;
    @Mock UserService userService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new AdminBrandController(brandService, displayLocaleResolver, userService))
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
    void createBrand_returnsCreated() throws Exception {
        BrandBody body = new BrandBody("Kyosho", "京商", "K", null);
        BrandDto created = new BrandDto(3L, "Kyosho", "Kyosho", "京商", "K", null, 0L);
        when(brandService.createBrand(body, "en-US")).thenReturn(created);

        mockMvc.perform(post("/admin/brands")
                        .with(authenticatedUser("1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Kyosho"));
    }

    @Test
    void updateBrand_returnsUpdated() throws Exception {
        BrandBody body = new BrandBody("Updated", null, "U", null);
        BrandDto updated = new BrandDto(3L, "Updated", "Updated", null, "U", null, 0L);
        when(brandService.updateBrand(3L, body, "en-US")).thenReturn(updated);

        mockMvc.perform(put("/admin/brands/3")
                        .with(authenticatedUser("1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.abbreviation").value("U"));
    }

    @Test
    void deleteBrand_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/admin/brands/3"))
                .andExpect(status().isNoContent());

        verify(brandService).deleteBrand(3L);
    }

    @Test
    void createBrandObject_returnsCreated() throws Exception {
        BrandObjectBody body = new BrandObjectBody(
                "Model A", null, null, null, null, null, null, null, null, null);
        BrandObjectDto created = sampleObjectDto();
        when(brandService.createBrandObject(2L, body, "en-US")).thenReturn(created);

        mockMvc.perform(post("/admin/brands/2/objects")
                        .with(authenticatedUser("1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nameEn").value("Model A"));
    }

    @Test
    void deleteBrandObject_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/admin/brands/objects/8"))
                .andExpect(status().isNoContent());

        verify(brandService).deleteBrandObject(8L);
    }

    @Test
    void uploadBrandLogo_returnsUpdatedBrand() throws Exception {
        BrandDto updated = new BrandDto(3L, "Kyosho", "Kyosho", "京商", "K", "logo.png", 0L);
        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", new byte[] {1, 2, 3});
        when(brandService.uploadBrandLogo(eq(3L), org.mockito.ArgumentMatchers.any(), eq("en-US")))
                .thenReturn(updated);

        mockMvc.perform(multipart("/admin/brands/3/logo")
                        .file(file)
                        .with(authenticatedUser("1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value("logo.png"));
    }

    private static BrandObjectDto sampleObjectDto() {
        return new BrandObjectDto(
                1L, "Model A", "Model A", null, null, null,
                null, null, null,
                2L, "Brand", "Brand", null,
                null, null, null, null,
                null, null, null, null,
                null, null, 0L);
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
