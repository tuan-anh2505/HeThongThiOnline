package com.example.exam.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exam.dto.AuthResponse;
import com.example.exam.dto.LoginRequest;
import com.example.exam.dto.RegisterRequest;
import com.example.exam.service.AuthService;
import com.example.exam.service.LoggingService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;
    private final LoggingService loggingService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request);
        // Ghi Log ngay khi đăng nhập thành công
        if (response != null && response.getMaTaiKhoan() != null) {
            loggingService.logLogin(response.getMaTaiKhoan(), httpRequest.getRemoteAddr());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestHeader(value = "X-User-ID", required = false) String maTaiKhoan,
            HttpServletRequest request) {
        
        Integer id = parseInteger(maTaiKhoan);
        // Ghi Log ngay khi nhấn nút đăng xuất
        if (id != null) {
            loggingService.logLogout(id, request.getRemoteAddr());
        }
        
        return ResponseEntity.ok(authService.logout(token, id, request.getRemoteAddr()));
    }

    private Integer parseInteger(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}