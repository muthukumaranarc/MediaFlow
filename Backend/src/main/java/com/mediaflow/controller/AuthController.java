package com.mediaflow.controller;

import com.mediaflow.dto.AuthRequest;
import com.mediaflow.dto.AuthResponse;
import com.mediaflow.dto.RegisterRequest;
import com.mediaflow.entity.User;
import com.mediaflow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            AuthResponse response = authService.register(req);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            AuthResponse response = authService.login(req);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(401).body(err);
        }
    }

    @GetMapping("/demo")
    public ResponseEntity<AuthResponse> demoLogin() {
        AuthResponse response = authService.getDemoUser();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Not authenticated");
            return ResponseEntity.status(401).body(err);
        }
        return ResponseEntity.ok(new AuthResponse(
                null,
                user.getUserId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole()
        ));
    }
}
