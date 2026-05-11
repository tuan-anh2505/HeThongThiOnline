package com.example.exam.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentStatsResponse {
    private String tenSinhVien;
    private BigDecimal diem;
    private BigDecimal tileLeDung;
    private Boolean daLam;
}
