package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String rawEmail = body.get("email");
        String rawPhone = body.get("phone");
        String identifier = (rawPhone != null && !rawPhone.isBlank())
                ? rawPhone.strip()
                : (rawEmail != null ? rawEmail.toLowerCase().strip() : null);
        String password = body.get("password");
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, password)
        );
        String token = jwtService.generate(identifier);
        return ResponseEntity.ok(Map.of("token", token));
    }
}
