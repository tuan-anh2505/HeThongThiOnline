package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "GiangVien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiangVien {

    @Id
    @Column(name = "MaGiangVien")
    private Integer maGiangVien;

    @Column(name = "MaTaiKhoan")
    private Integer maTaiKhoan;

    @Column(name = "BoMon")
    private String boMon;
}