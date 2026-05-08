package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "TrangThaiThi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrangThaiThi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTrangThai")
    private Integer maTrangThai;

    @Column(name = "MaBaiLam")
    private Integer maBaiLam;

    @Column(name = "DangOnline")
    private Boolean dangOnline;

    @Column(name = "LanCuoiHoatDong")
    private LocalDateTime lanCuoiHoatDong;
}