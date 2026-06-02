package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandBody;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectBody;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.service.BrandService;
import com.zjusthow.minicollections.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/admin/brands")
public class AdminBrandController {

    private final BrandService brandService;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final UserService userService;

    public AdminBrandController(
            BrandService brandService,
            DisplayLocaleResolver displayLocaleResolver,
            UserService userService) {
        this.brandService = brandService;
        this.displayLocaleResolver = displayLocaleResolver;
        this.userService = userService;
    }

    private String effectiveLocale(String acceptLanguage, User user) {
        UserEntity ue = user != null ? userService.getUserById(Long.parseLong(user.getUsername())) : null;
        return displayLocaleResolver.resolveEffectiveLocale(acceptLanguage, ue);
    }

    @PostMapping
    public ResponseEntity<BrandDto> createBrand(
            @RequestBody BrandBody body,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(brandService.createBrand(body, effectiveLocale(acceptLanguage, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandDto> updateBrand(
            @PathVariable Long id,
            @RequestBody BrandBody body,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.updateBrand(id, body, effectiveLocale(acceptLanguage, user)));
    }

    @PostMapping("/{id}/logo")
    public ResponseEntity<BrandDto> uploadBrandLogo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(brandService.uploadBrandLogo(id, file, effectiveLocale(acceptLanguage, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{brandId}/objects")
    public ResponseEntity<BrandObjectDto> createBrandObject(
            @PathVariable Long brandId,
            @RequestBody BrandObjectBody body,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(brandService.createBrandObject(brandId, body, effectiveLocale(acceptLanguage, user)));
    }

    @PutMapping("/objects/{id}")
    public ResponseEntity<BrandObjectDto> updateBrandObject(
            @PathVariable Long id,
            @RequestBody BrandObjectBody body,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.updateBrandObject(id, body, effectiveLocale(acceptLanguage, user)));
    }

    @DeleteMapping("/objects/{id}")
    public ResponseEntity<Void> deleteBrandObject(@PathVariable Long id) {
        brandService.deleteBrandObject(id);
        return ResponseEntity.noContent().build();
    }
}
