package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.SeriesBody;
import com.zjusthow.minicollections.model.SeriesDto;
import com.zjusthow.minicollections.service.SeriesService;
import com.zjusthow.minicollections.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/series")
public class AdminSeriesController {

    private final SeriesService seriesService;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final UserService userService;

    public AdminSeriesController(
            SeriesService seriesService,
            DisplayLocaleResolver displayLocaleResolver,
            UserService userService) {
        this.seriesService = seriesService;
        this.displayLocaleResolver = displayLocaleResolver;
        this.userService = userService;
    }

    private String effectiveLocale(String acceptLanguage, User user) {
        UserEntity ue = user != null ? userService.getUserById(Long.parseLong(user.getUsername())) : null;
        return displayLocaleResolver.resolveEffectiveLocale(acceptLanguage, ue);
    }

    @PostMapping("/brands/{brandId}")
    public ResponseEntity<SeriesDto> createSeries(
            @PathVariable Long brandId,
            @RequestBody SeriesBody body,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(seriesService.create(brandId, body, effectiveLocale(acceptLanguage, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeriesDto> updateSeries(
            @PathVariable Long id,
            @RequestBody SeriesBody body,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(seriesService.update(id, body, effectiveLocale(acceptLanguage, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeries(@PathVariable Long id) {
        seriesService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
