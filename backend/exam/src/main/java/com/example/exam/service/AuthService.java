package com.example.exam.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.exam.dto.AuthResponse;
import com.example.exam.dto.LoginRequest;
import com.example.exam.dto.RegisterRequest;
import com.example.exam.entity.TaiKhoan;
import com.example.exam.repository.TaiKhoanRepository;
import com.example.exam.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final TaiKhoanRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (repository.existsByTenDangNhap(request.getTenDangNhap())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        TaiKhoan taikhoan = TaiKhoan.builder()
                .tenDangNhap(request.getTenDangNhap())
                .matKhau(passwordEncoder.encode(request.getMatKhau()))
                .hoTen(request.getHoTen())
                .email(request.getEmail())
                .soDienThoai(request.getSoDienThoai())
                .vaiTro((byte) 0)
                .ngayTao(LocalDateTime.now())
                .build();

        repository.save(taikhoan);

        String token = jwtUtil.generateToken(taikhoan.getTenDangNhap());

        return new AuthResponse(token, "Đăng ký thành công");
    }

    public AuthResponse login(LoginRequest request) {
        TaiKhoan taikhoan = repository.findByTenDangNhap(request.getTenDangNhap())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if (!passwordEncoder.matches(request.getMatKhau(), taikhoan.getMatKhau())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng");
        }

        String token = jwtUtil.generateToken(taikhoan.getTenDangNhap());

        return new AuthResponse(token, "Đăng nhập thành công");
    }
}
