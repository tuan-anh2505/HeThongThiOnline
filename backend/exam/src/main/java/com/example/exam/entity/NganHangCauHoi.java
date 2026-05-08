package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NganHangCauHoi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NganHangCauHoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaNganHang")
    private Integer maNganHang;

    @Column(name = "TenNganHang")
    private String tenNganHang;

    @Column(name = "MoTa")
    private String moTa;

    @Column(name = "MaGiangVien")
    private Integer maGiangVien;
}