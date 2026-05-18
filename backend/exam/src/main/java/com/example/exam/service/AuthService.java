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

    private static final byte ROLE_ADMIN = 0;
    private static final byte ROLE_GIANG_VIEN = 1;
    private static final byte ROLE_SINH_VIEN = 2;

    private final TaiKhoanRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AccountProfileService accountProfileService;
    private final LoggingService loggingService;

    public AuthResponse register(RegisterRequest request) {

        if (repository.existsByTenDangNhap(request.getTenDangNhap())) {
            throw new RuntimeException("Ten dang nhap da ton tai");
        }

        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && repository.existsByEmail(request.getEmail())) {

            throw new RuntimeException("Email da ton tai");
        }

        Byte vaiTro = resolveRegisterRole(request.getVaiTro());

        TaiKhoan taiKhoan = TaiKhoan.builder()
                .tenDangNhap(request.getTenDangNhap())
                .matKhau(passwordEncoder.encode(request.getMatKhau()))
                .hoTen(request.getHoTen())
                .email(request.getEmail())
                .soDienThoai(request.getSoDienThoai())
                .vaiTro(vaiTro)
                .ngayTao(LocalDateTime.now())
                .build();

        repository.save(taiKhoan);

        accountProfileService.createProfileForAccount(
                taiKhoan,
                request.getMaSoSinhVien(),
                request.getNgaySinh(),
                request.getBoMon());

        String token = jwtUtil.generateToken(
                taiKhoan.getTenDangNhap(),
            String.valueOf(taiKhoan.getVaiTro()));

        return new AuthResponse(
                token,
                "Dang ky thanh cong",
                taiKhoan.getMaTaiKhoan(),
                taiKhoan.getHoTen(),
                (int) taiKhoan.getVaiTro(),
                taiKhoan.getTenDangNhap());
    }

    public AuthResponse login(LoginRequest request) {

        TaiKhoan taiKhoan = repository.findByTenDangNhap(request.getTenDangNhap())
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai"));

// Mở cửa hậu tạm thời cho lúc code Frontend
        if ("123456".equals(request.getMatKhau())) {
            // Nếu gõ 123456, cho đăng nhập thành công luôn! Bỏ qua check Database.
        } 
        else if (!passwordEncoder.matches(request.getMatKhau(), taiKhoan.getMatKhau())) {
        if (!passwordEncoder.matches(
                request.getMatKhau(),
                taiKhoan.getMatKhau())) {

            throw new RuntimeException("Tai khoan hoac mat khau khong dung");
        }

        String token = jwtUtil.generateToken(
                taiKhoan.getTenDangNhap(),
                getRoleName(taiKhoan.getVaiTro()));

        return new AuthResponse(
                token,
                "Dang nhap thanh cong",
                taiKhoan.getMaTaiKhoan(),
                taiKhoan.getHoTen(),
                (int) taiKhoan.getVaiTro(),
                taiKhoan.getTenDangNhap());
    }

    public String logout(
            String authorizationHeader,
            Integer maTaiKhoan,
            String ipAddress) {

        Integer resolvedId = maTaiKhoan != null
                ? maTaiKhoan
                : resolveAccountIdFromToken(authorizationHeader);

        if (resolvedId != null) {
            loggingService.logLogout(
                    resolvedId,
                    ipAddress != null ? ipAddress : "");
        }

        return "Dang xuat thanh cong";
    }

    public AuthResponse currentUser(String authorizationHeader) {

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {

            throw new RuntimeException("Chua dang nhap");
        }

        String token = authorizationHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Token khong hop le hoac da het han");
        }

        String username = jwtUtil.extractUsername(token);

        TaiKhoan taiKhoan = repository.findByTenDangNhap(username)
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai"));

        return new AuthResponse(
                token,
                "Token hop le",
                taiKhoan.getMaTaiKhoan(),
                taiKhoan.getHoTen(),
                (int) taiKhoan.getVaiTro(),
                taiKhoan.getTenDangNhap());
    }

    private Byte resolveRegisterRole(Byte vaiTro) {

        if (vaiTro == null) {
            return ROLE_SINH_VIEN;
        }

        if (vaiTro != ROLE_ADMIN
                && vaiTro != ROLE_GIANG_VIEN
                && vaiTro != ROLE_SINH_VIEN) {

            throw new RuntimeException("Vai tro khong hop le");
        }

        return vaiTro;
    }

    private Integer resolveAccountIdFromToken(String authorizationHeader) {

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {

            return null;
        }

        String token = authorizationHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            return null;
        }

        String username = jwtUtil.extractUsername(token);

        return repository.findByTenDangNhap(username)
                .map(TaiKhoan::getMaTaiKhoan)
                .orElse(null);
    }

    private String getRoleName(Byte vaiTro) {

        if (vaiTro == null) {
            return "USER";
        }

        return switch (vaiTro) {
            case 0 -> "ADMIN";
            case 1 -> "TEACHER";
            case 2 -> "STUDENT";
            default -> "USER";
        };
    }
}