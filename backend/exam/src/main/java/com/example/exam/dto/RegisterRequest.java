package com.example.exam.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class RegisterRequest {

    private String tenDangNhap;

    private String matKhau;

    private String hoTen;

    private String email;

    private String soDienThoai;

    private Byte vaiTro;

    private String maSoSinhVien;

    private LocalDate ngaySinh;

    private String boMon;
}
