package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SinhVienLop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(SinhVienLopId.class)
public class SinhVienLop {

    @Id
    @Column(name = "MaSinhVien")
    private Integer maSinhVien;

    @Id
    @Column(name = "MaLop")
    private Integer maLop;
}