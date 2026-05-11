package com.example.exam.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResponse {
    private Integer maBaiThi;
    private String tenBaiThi;
    private Integer thoiLuong;
    private LocalDateTime ngayTao;
    private Integer soSinhVien;
    private Boolean conHan;
    private String tenMonThi;
    private String tenLop;
}
