package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.service.BrandService;
import com.zjusthow.minicollections.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {

    private final BrandService brandService;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final UserService userService;

    public BrandController(
            BrandService brandService,
            DisplayLocaleResolver displayLocaleResolver,
            UserService userService) {
        this.brandService = brandService;
        this.displayLocaleResolver = displayLocaleResolver;
        this.userService = userService;
    }

    private String effectiveLocale(String locale, String acceptLanguage, User user) {
        UserEntity ue = user != null ? userService.getUserByEmail(user.getUsername()) : null;
        return displayLocaleResolver.resolveEffectiveLocale(locale, acceptLanguage, ue);
    }

    @GetMapping
    public ResponseEntity<List<BrandDto>> getBrands(
            @RequestParam(required = false) String locale,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrands(effectiveLocale(locale, acceptLanguage, user)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<BrandDto>> searchBrands(
            @RequestParam String keyword,
            @RequestParam(required = false) String locale,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrands(keyword, effectiveLocale(locale, acceptLanguage, user)));
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<BrandDto> getBrandById(
            @PathVariable Long brandId,
            @RequestParam(required = false) String locale,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandById(brandId, effectiveLocale(locale, acceptLanguage, user)));
    }

    @GetMapping("/{brandId}/objects")
    public ResponseEntity<List<BrandObjectDto>> getBrandObjectsByBrandId(
            @PathVariable Long brandId,
            @RequestParam(required = false) String locale,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandObjectsByBrandId(
                brandId, effectiveLocale(locale, acceptLanguage, user)));
    }

    @GetMapping("/objects/search")
    public ResponseEntity<List<BrandObjectDto>> searchBrandObjects(
            @RequestParam String keyword,
            @RequestParam(required = false) String locale,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandObjects(
                keyword, effectiveLocale(locale, acceptLanguage, user)));
    }

    @GetMapping("/objects/{id}")
    public ResponseEntity<BrandObjectDto> getBrandObjectById(
            @PathVariable Long id,
            @RequestParam(required = false) String locale,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandObjectById(id, effectiveLocale(locale, acceptLanguage, user)));
    }
}
