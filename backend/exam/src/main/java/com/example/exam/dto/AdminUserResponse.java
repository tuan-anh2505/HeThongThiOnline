package com.example.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {
    private Integer maTaiKhoan;
    private String tenDangNhap;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private Byte vaiTro;
    private LocalDateTime ngayTao;
}
