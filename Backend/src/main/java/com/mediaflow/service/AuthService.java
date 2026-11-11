package com.mediaflow.service;

import com.mediaflow.dto.AuthRequest;
import com.mediaflow.dto.AuthResponse;
import com.mediaflow.dto.RegisterRequest;
import com.mediaflow.entity.User;
import com.mediaflow.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecretKey key;
    private final long expirationMs;

    public AuthService(UserRepository userRepository,
                       @Value("${mediaflow.jwt.secret}") String secret,
                       @Value("${mediaflow.jwt.expiration-ms:86400000}") long expirationMs) {
        this.userRepository = userRepository;
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("An account with email " + req.getEmail() + " already exists.");
        }
        User user = new User(req.getDisplayName(), req.getEmail(), passwordEncoder.encode(req.getPassword()), "ROLE_USER");
        user = userRepository.save(user);

        String token = generateToken(user);
        return new AuthResponse(token, user.getUserId(), user.getDisplayName(), user.getEmail(), user.getRole());
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = generateToken(user);
        return new AuthResponse(token, user.getUserId(), user.getDisplayName(), user.getEmail(), user.getRole());
    }

    public AuthResponse getDemoUser() {
        String demoEmail = "demo@mediaflow.local";
        User user = userRepository.findByEmail(demoEmail).orElseGet(() -> {
            User demo = new User("Demo User", demoEmail, passwordEncoder.encode("demo1234"), "ROLE_USER");
            return userRepository.save(demo);
        });

        String token = generateToken(user);
        return new AuthResponse(token, user.getUserId(), user.getDisplayName(), user.getEmail(), user.getRole());
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getUserId())
                .claim("displayName", user.getDisplayName())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    public Optional<User> validateTokenAndGetUser(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String email = claims.getSubject();
            return userRepository.findByEmail(email);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization token missing or invalid.");
        }
        String token = authHeader.substring(7);
        return validateTokenAndGetUser(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired session token."));
    }
}
