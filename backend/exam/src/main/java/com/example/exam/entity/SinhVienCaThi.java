package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SinhVienCaThi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(SinhVienCaThiId.class)
public class SinhVienCaThi {

    @Id
    @Column(name = "MaSinhVien")
    private Integer maSinhVien;

    @Id
    @Column(name = "MaCaThi")
    private Integer maCaThi;

    @Column(name = "TrangThai")
    private String trangThai;
}