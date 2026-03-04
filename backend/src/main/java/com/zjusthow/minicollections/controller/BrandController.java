package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.service.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<List<BrandDto>> getBrands() {
        return ResponseEntity.ok(brandService.getBrands());
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<BrandDto> getBrandById(@PathVariable Long brandId) {
        return ResponseEntity.ok(brandService.getBrandById(brandId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<BrandDto>> searchBrands(@RequestParam String keyword) {
        return ResponseEntity.ok(brandService.searchBrands(keyword));
    }

    @GetMapping("/{brandId}/objects")
    public ResponseEntity<List<BrandObjectDto>> getBrandObjectsByBrandId(@PathVariable Long brandId) {
        return ResponseEntity.ok(brandService.getBrandObjectsByBrandId(brandId));
    }
}
