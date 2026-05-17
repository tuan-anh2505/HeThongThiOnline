package com.example.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private Integer maTaiKhoan;
    private String hoTen;
    private Integer vaiTro;
    private String tenDangNhap;
}