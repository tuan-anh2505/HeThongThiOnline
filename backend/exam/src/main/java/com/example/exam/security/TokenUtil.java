package com.example.exam.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenUtil {

    private final JwtUtil jwtUtil;

    /**
     * Extract username from JWT token in Authorization header
     * 
     * @param authorizationHeader Authorization header value
     * @return username extracted from token
     * @throws RuntimeException if token is invalid
     */
    public String extractUsernameFromAuthHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid authorization header");
        }

        String token = authorizationHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        return jwtUtil.extractUsername(token);
    }

    /**
     * Extract token from Authorization header
     * 
     * @param authorizationHeader Authorization header value
     * @return token string
     */
    public String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid authorization header");
        }
        return authorizationHeader.substring(7);
    }

    /**
     * Check if token is valid
     * 
     * @param token JWT token
     * @return true if token is valid
     */
    public boolean isTokenValid(String token) {
        try {
            return jwtUtil.validateToken(token);
        } catch (Exception e) {
            return false;
        }
    }
}
