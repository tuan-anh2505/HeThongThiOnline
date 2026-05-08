package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "BaiThi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaiThi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaBaiThi")
    private Integer maBaiThi;

    @Column(name = "TenBaiThi")
    private String tenBaiThi;

    @Column(name = "MaNganHang")
    private Integer maNganHang;

    @Column(name = "MaLop")
    private Integer maLop;

    @Column(name = "MaCaThi")
    private Integer maCaThi;

    @Column(name = "MaMonThi")
    private Integer maMonThi;

    @Column(name = "ThoiLuong")
    private Integer thoiLuong;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao;
}