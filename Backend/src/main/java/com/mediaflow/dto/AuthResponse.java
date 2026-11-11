package com.mediaflow.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String displayName;
    private String email;
    private String role;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String displayName, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.displayName = displayName;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
