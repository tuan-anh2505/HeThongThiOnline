package com.example.exam.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.exam.dto.AdminUserResponse;
import com.example.exam.entity.TaiKhoan;
import com.example.exam.repository.TaiKhoanRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountProfileService accountProfileService;

    public List<AdminUserResponse> getAllUsers() {
        return taiKhoanRepository.findAll().stream()
                .map(this::convertToAdminUserResponse)
                .collect(Collectors.toList());
    }

    public Optional<AdminUserResponse> getUserById(Integer maTaiKhoan) {
        return taiKhoanRepository.findById(maTaiKhoan)
                .map(this::convertToAdminUserResponse);
    }

    public TaiKhoan createUser(TaiKhoan taiKhoan) {
        if (taiKhoanRepository.existsByTenDangNhap(taiKhoan.getTenDangNhap())) {
            throw new RuntimeException("Ten dang nhap da ton tai");
        }
        if (taiKhoan.getEmail() != null && !taiKhoan.getEmail().isBlank()
                && taiKhoanRepository.existsByEmail(taiKhoan.getEmail())) {
            throw new RuntimeException("Email da ton tai");
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(taiKhoan.getMatKhau()));
        taiKhoan.setNgayTao(LocalDateTime.now());
        TaiKhoan saved = taiKhoanRepository.save(taiKhoan);
        accountProfileService.createProfileForAccount(saved);
        return saved;
    }

    public TaiKhoan updateUser(Integer maTaiKhoan, TaiKhoan taiKhoan) {
        return taiKhoanRepository.findById(maTaiKhoan).map(user -> {
            if (taiKhoan.getHoTen() != null) {
                user.setHoTen(taiKhoan.getHoTen());
            }
            if (taiKhoan.getEmail() != null) {
                user.setEmail(taiKhoan.getEmail());
            }
            if (taiKhoan.getSoDienThoai() != null) {
                user.setSoDienThoai(taiKhoan.getSoDienThoai());
            }
            if (taiKhoan.getVaiTro() != null) {
                user.setVaiTro(taiKhoan.getVaiTro());
            }
            if (taiKhoan.getMatKhau() != null && !taiKhoan.getMatKhau().isEmpty()) {
                user.setMatKhau(passwordEncoder.encode(taiKhoan.getMatKhau()));
            }
            return taiKhoanRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai"));
    }

    public void deleteUser(Integer maTaiKhoan) {
        taiKhoanRepository.deleteById(maTaiKhoan);
    }

    private AdminUserResponse convertToAdminUserResponse(TaiKhoan taiKhoan) {
        return AdminUserResponse.builder()
                .maTaiKhoan(taiKhoan.getMaTaiKhoan())
                .tenDangNhap(taiKhoan.getTenDangNhap())
                .hoTen(taiKhoan.getHoTen())
                .email(taiKhoan.getEmail())
                .soDienThoai(taiKhoan.getSoDienThoai())
                .vaiTro(taiKhoan.getVaiTro())
                .ngayTao(taiKhoan.getNgayTao())
                .build();
    }
}
