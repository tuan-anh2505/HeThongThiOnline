package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "CauHoi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CauHoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaCauHoi")
    private Integer maCauHoi;

    @Column(name = "MaNganHang")
    private Integer maNganHang;

    @Column(name = "NoiDung")
    private String noiDung;

    @Column(name = "LoaiCauHoi")
    private Integer loaiCauHoi;

    @Column(name = "Diem")
    private BigDecimal diem;

    @Transient
    private List<DapAnTracNghiem> dapAnTracNghiem;

    @Transient
    private DapAnDungSai dapAnDungSai;

    @Transient
    private List<DapAnGhepTu> dapAnGhepTu;

    @Transient
    private List<DapAnDienChoTrong> dapAnDienChoTrong;
}
