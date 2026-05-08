package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ViPhamThi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViPhamThi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaViPham")
    private Integer maViPham;

    @Column(name = "MaBaiLam")
    private Integer maBaiLam;

    @Column(name = "LoaiViPham")
    private String loaiViPham;

    @Column(name = "ThoiGian")
    private LocalDateTime thoiGian;
}