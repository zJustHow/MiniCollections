package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.service.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/brand_objects")
public class BrandObjectController {

    private final BrandService brandService;

    public BrandObjectController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<BrandObjectDto>> searchBrandObjects(
            @RequestParam String keyword) {
        return ResponseEntity.ok(brandService.searchBrandObjects(keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandObjectDto> getBrandObjectById(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.getBrandObjectById(id));
    }
}

