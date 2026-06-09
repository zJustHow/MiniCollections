package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.ScaleBody;
import com.zjusthow.minicollections.model.ScaleDto;
import com.zjusthow.minicollections.service.ScaleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/scales")
public class AdminScaleController {

    private final ScaleService scaleService;

    public AdminScaleController(ScaleService scaleService) {
        this.scaleService = scaleService;
    }

    @PostMapping
    public ResponseEntity<ScaleDto> createScale(@RequestBody ScaleBody body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scaleService.create(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScaleDto> updateScale(@PathVariable Long id, @RequestBody ScaleBody body) {
        return ResponseEntity.ok(scaleService.update(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScale(@PathVariable Long id) {
        scaleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
