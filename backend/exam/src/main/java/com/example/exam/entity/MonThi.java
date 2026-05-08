package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "MonThi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonThi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaMonThi")
    private Integer maMonThi;

    @Column(name = "MaMon")
    private String maMon;

    @Column(name = "TenMonThi")
    private String tenMonThi;

    @Column(name = "SoTinChi")
    private Integer soTinChi;

    @Column(name = "MoTa")
    private String moTa;

    @Column(name = "MaGiangVien")
    private Integer maGiangVien;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao;
}
