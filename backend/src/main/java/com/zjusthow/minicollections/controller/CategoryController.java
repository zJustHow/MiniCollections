package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.CategoryDto;
import com.zjusthow.minicollections.service.CategoryService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final DisplayLocaleResolver displayLocaleResolver;

    public CategoryController(
            CategoryService categoryService,
            DisplayLocaleResolver displayLocaleResolver) {
        this.categoryService = categoryService;
        this.displayLocaleResolver = displayLocaleResolver;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> listCategories(
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        String locale = displayLocaleResolver.resolveEffectiveLocale(acceptLanguage, user);
        return ResponseEntity.ok(categoryService.listAll(locale));
    }
}
