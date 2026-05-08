package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietBaiLam")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietBaiLam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaChiTiet")
    private Integer maChiTiet;

    @Column(name = "MaBaiLam")
    private Integer maBaiLam;

    @Column(name = "MaCauHoi")
    private Integer maCauHoi;

    @Column(name = "CauTraLoi")
    private String cauTraLoi;

    @Column(name = "DiemDatDuoc")
    private BigDecimal diemDatDuoc;
}