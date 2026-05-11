package com.example.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAnalyticsResponse {
    private Integer maBaiThi;
    private String tenBaiThi;
    private Integer soSinhVienDaLam;
    private Integer soSinhVienTongCong;
    private Double diemTrungBinh;
    private Double tileTracNghiemTrungBinh;
    private StudentStatsResponse studentDiemCao;
}
