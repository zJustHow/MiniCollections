package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.CategoryBody;
import com.zjusthow.minicollections.model.CategoryDto;
import com.zjusthow.minicollections.service.CategoryService;
import com.zjusthow.minicollections.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final UserService userService;

    public AdminCategoryController(
            CategoryService categoryService,
            DisplayLocaleResolver displayLocaleResolver,
            UserService userService) {
        this.categoryService = categoryService;
        this.displayLocaleResolver = displayLocaleResolver;
        this.userService = userService;
    }

    private String effectiveLocale(String acceptLanguage, User user) {
        UserEntity ue = user != null ? userService.getUserById(Long.parseLong(user.getUsername())) : null;
        return displayLocaleResolver.resolveEffectiveLocale(acceptLanguage, ue);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @RequestBody CategoryBody body,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.create(body, effectiveLocale(acceptLanguage, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryBody body,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(categoryService.update(id, body, effectiveLocale(acceptLanguage, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
