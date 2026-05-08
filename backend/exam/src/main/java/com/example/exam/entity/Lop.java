package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Lop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaLop")
    private Integer maLop;

    @Column(name = "TenLop")
    private String tenLop;

    @Column(name = "NienKhoa")
    private String nienKhoa;

    @Column(name = "MaGiangVien")
    private Integer maGiangVien;
}