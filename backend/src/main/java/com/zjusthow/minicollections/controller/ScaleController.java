package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.ScaleDto;
import com.zjusthow.minicollections.service.ScaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/scales")
public class ScaleController {

    private final ScaleService scaleService;

    public ScaleController(ScaleService scaleService) {
        this.scaleService = scaleService;
    }

    @GetMapping
    public ResponseEntity<List<ScaleDto>> listScales() {
        return ResponseEntity.ok(scaleService.listAll());
    }
}
