package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BaiLam")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaiLam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaBaiLam")
    private Integer maBaiLam;

    @Column(name = "MaSinhVien")
    private Integer maSinhVien;

    @Column(name = "MaBaiThi")
    private Integer maBaiThi;

    @Column(name = "ThoiGianBatDau")
    private LocalDateTime thoiGianBatDau;

    @Column(name = "ThoiGianNop")
    private LocalDateTime thoiGianNop;

    @Column(name = "DiemTong")
    private BigDecimal diemTong;
}