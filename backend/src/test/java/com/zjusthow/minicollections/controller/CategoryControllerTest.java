package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.CategoryDto;
import com.zjusthow.minicollections.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock CategoryService categoryService;
    @Mock DisplayLocaleResolver displayLocaleResolver;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new CategoryController(categoryService, displayLocaleResolver))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
        when(displayLocaleResolver.resolveEffectiveLocale(
                        nullable(String.class),
                        nullable(org.springframework.security.core.userdetails.User.class)))
                .thenReturn("en-US");
    }

    @Test
    void listCategories_returnsLocalizedList() throws Exception {
        CategoryDto category = new CategoryDto(1L, "cars", "Cars", "Cars", "汽车");
        when(categoryService.listAll("en-US")).thenReturn(List.of(category));

        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("cars"))
                .andExpect(jsonPath("$[0].name").value("Cars"));

        verify(categoryService).listAll(eq("en-US"));
    }
}
