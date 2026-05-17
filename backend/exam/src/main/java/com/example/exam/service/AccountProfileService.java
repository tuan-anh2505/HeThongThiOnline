package com.example.exam.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.example.exam.entity.GiangVien;
import com.example.exam.entity.SinhVien;
import com.example.exam.entity.TaiKhoan;
import com.example.exam.repository.GiangVienRepository;
import com.example.exam.repository.SinhVienRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountProfileService {

    private static final byte ROLE_GIANG_VIEN = 1;
    private static final byte ROLE_SINH_VIEN = 2;

    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;

    public void createProfileForAccount(TaiKhoan taiKhoan) {
        createProfileForAccount(taiKhoan, null, null, null);
    }

    public void createProfileForAccount(
            TaiKhoan taiKhoan,
            String maSoSinhVien,
            LocalDate ngaySinh,
            String boMon) {
        if (taiKhoan == null || taiKhoan.getMaTaiKhoan() == null || taiKhoan.getVaiTro() == null) {
            return;
        }

        Byte vaiTro = taiKhoan.getVaiTro();
        if (vaiTro == ROLE_GIANG_VIEN) {
            createGiangVienIfMissing(taiKhoan, boMon);
        } else if (vaiTro == ROLE_SINH_VIEN) {
            createSinhVienIfMissing(taiKhoan, maSoSinhVien, ngaySinh);
        }
    }

    private void createGiangVienIfMissing(TaiKhoan taiKhoan, String boMon) {
        if (giangVienRepository.findByMaTaiKhoan(taiKhoan.getMaTaiKhoan()).isPresent()) {
            return;
        }

        giangVienRepository.save(GiangVien.builder()
                .maGiangVien(taiKhoan.getMaTaiKhoan())
                .maTaiKhoan(taiKhoan.getMaTaiKhoan())
                .boMon(boMon)
                .build());
    }

    private void createSinhVienIfMissing(TaiKhoan taiKhoan, String maSoSinhVien, LocalDate ngaySinh) {
        if (sinhVienRepository.findByMaTaiKhoan(taiKhoan.getMaTaiKhoan()).isPresent()) {
            return;
        }

        sinhVienRepository.save(SinhVien.builder()
                .maSinhVien(taiKhoan.getMaTaiKhoan())
                .maTaiKhoan(taiKhoan.getMaTaiKhoan())
                .maSoSinhVien(resolveMaSoSinhVien(taiKhoan, maSoSinhVien))
                .ngaySinh(ngaySinh)
                .build());
    }

    private String resolveMaSoSinhVien(TaiKhoan taiKhoan, String maSoSinhVien) {
        if (maSoSinhVien != null && !maSoSinhVien.isBlank()) {
            return maSoSinhVien.trim();
        }
        return String.format("SV%06d", taiKhoan.getMaTaiKhoan());
    }
}
