package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.model.BrandObjectBody;
import com.zjusthow.minicollections.model.SeriesDto;
import com.zjusthow.minicollections.model.SliceResponse;
import com.zjusthow.minicollections.service.BrandService;
import com.zjusthow.minicollections.service.SeriesService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/brands")
public class BrandController {

    private final BrandService brandService;
    private final SeriesService seriesService;
    private final DisplayLocaleResolver displayLocaleResolver;

    public BrandController(
            BrandService brandService,
            SeriesService seriesService,
            DisplayLocaleResolver displayLocaleResolver) {
        this.brandService = brandService;
        this.seriesService = seriesService;
        this.displayLocaleResolver = displayLocaleResolver;
    }

    private String effectiveLocale(String acceptLanguage, User user) {
        return displayLocaleResolver.resolveEffectiveLocale(acceptLanguage, user);
    }

    @GetMapping
    public ResponseEntity<SliceResponse<BrandDto>> getBrands(
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String cursor,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandsSlice(
                effectiveLocale(acceptLanguage, user), size, cursor));
    }

    @GetMapping("/search")
    public ResponseEntity<SliceResponse<BrandDto>> searchBrands(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String cursor,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandsSlice(
                keyword, effectiveLocale(acceptLanguage, user), size, cursor));
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<BrandDto> getBrandById(
            @PathVariable Long brandId,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandById(brandId, effectiveLocale(acceptLanguage, user)));
    }

    @GetMapping("/{brandId}/series")
    public ResponseEntity<java.util.List<SeriesDto>> getSeriesByBrandId(
            @PathVariable Long brandId,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(seriesService.listByBrandId(
                brandId, effectiveLocale(acceptLanguage, user)));
    }

    @GetMapping("/{brandId}/objects")
    public ResponseEntity<SliceResponse<BrandObjectDto>> getBrandObjectsByBrandId(
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String cursor,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandObjectsSlice(
                brandId, effectiveLocale(acceptLanguage, user), size, cursor));
    }

    @GetMapping("/{brandId}/objects/search")
    public ResponseEntity<SliceResponse<BrandObjectDto>> searchBrandObjectsByBrandId(
            @PathVariable Long brandId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String cursor,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandObjectsByBrandIdSlice(
                keyword, brandId, effectiveLocale(acceptLanguage, user), size, cursor));
    }

    @GetMapping("/objects/search")
    public ResponseEntity<SliceResponse<BrandObjectDto>> searchBrandObjects(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String cursor,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandObjectsSlice(
                keyword, effectiveLocale(acceptLanguage, user), size, cursor));
    }

    @GetMapping("/objects/{id}")
    public ResponseEntity<BrandObjectDto> getBrandObjectById(
            @PathVariable Long id,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandObjectById(id, effectiveLocale(acceptLanguage, user)));
    }

    @PostMapping("/{brandId}/objects")
    public ResponseEntity<BrandObjectDto> createBrandObject(
            @PathVariable Long brandId,
            @RequestBody BrandObjectBody request,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(brandService.createBrandObject(brandId, request, effectiveLocale(acceptLanguage, user)));
    }

    @PutMapping("/objects/{id}")
    public ResponseEntity<BrandObjectDto> updateBrandObject(
            @PathVariable Long id,
            @RequestBody BrandObjectBody request,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.updateBrandObject(id, request, effectiveLocale(acceptLanguage, user)));
    }

    @DeleteMapping("/objects/{id}")
    public ResponseEntity<Void> deleteBrandObject(@PathVariable Long id) {
        brandService.deleteBrandObject(id);
        return ResponseEntity.noContent().build();
    }
}
