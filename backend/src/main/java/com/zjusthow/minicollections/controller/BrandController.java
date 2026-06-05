package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.model.BrandObjectBody;
import com.zjusthow.minicollections.model.BrandObjectSearchFacetsDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.SeriesDto;
import com.zjusthow.minicollections.service.BrandService;
import com.zjusthow.minicollections.service.SeriesService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<PageResponse<BrandDto>> getBrands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandsPage(
                effectiveLocale(acceptLanguage, user), page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<BrandDto>> searchBrands(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandsPage(
                keyword, effectiveLocale(acceptLanguage, user), page, size));
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
    public ResponseEntity<PageResponse<BrandObjectDto>> getBrandObjectsByBrandId(
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.getBrandObjectsPage(
                brandId, effectiveLocale(acceptLanguage, user), page, size));
    }

    @GetMapping("/{brandId}/objects/search/facets")
    public ResponseEntity<BrandObjectSearchFacetsDto> searchBrandObjectsFacetsByBrandId(
            @PathVariable Long brandId,
            @RequestParam String keyword,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandObjectsByBrandIdFacets(
                keyword, brandId, effectiveLocale(acceptLanguage, user)));
    }

    @GetMapping("/{brandId}/objects/search")
    public ResponseEntity<PageResponse<BrandObjectDto>> searchBrandObjectsByBrandId(
            @PathVariable Long brandId,
            @RequestParam String keyword,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<Long> scaleIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandObjectsByBrandIdPage(
                keyword,
                brandId,
                categoryIds,
                scaleIds,
                effectiveLocale(acceptLanguage, user),
                page,
                size));
    }

    @GetMapping("/objects/search/facets")
    public ResponseEntity<BrandObjectSearchFacetsDto> searchBrandObjectsFacets(
            @RequestParam String keyword,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandObjectsFacets(
                keyword, effectiveLocale(acceptLanguage, user)));
    }

    @GetMapping("/objects/search")
    public ResponseEntity<PageResponse<BrandObjectDto>> searchBrandObjects(
            @RequestParam String keyword,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<Long> brandIds,
            @RequestParam(required = false) List<Long> scaleIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(brandService.searchBrandObjectsPage(
                keyword,
                categoryIds,
                brandIds,
                scaleIds,
                effectiveLocale(acceptLanguage, user),
                page,
                size));
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
