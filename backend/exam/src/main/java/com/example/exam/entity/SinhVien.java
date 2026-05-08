package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "SinhVien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SinhVien {

    @Id
    @Column(name = "MaSinhVien")
    private Integer maSinhVien;

    @Column(name = "MaTaiKhoan")
    private Integer maTaiKhoan;

    @Column(name = "MaSoSinhVien")
    private String maSoSinhVien;

    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;
}