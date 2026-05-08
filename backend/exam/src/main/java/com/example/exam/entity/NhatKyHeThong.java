package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "NhatKyHeThong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhatKyHeThong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaLog")
    private Integer maLog;

    @Column(name = "MaTaiKhoan")
    private Integer maTaiKhoan;

    @Column(name = "HanhDong")
    private String hanhDong;

    @Column(name = "ThoiGian")
    private LocalDateTime thoiGian;

    @Column(name = "DiaChiIP")
    private String diaChiIP;
}