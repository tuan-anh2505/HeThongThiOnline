package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DapAnTracNghiem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DapAnTracNghiem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDapAn")
    private Integer maDapAn;

    @Column(name = "MaCauHoi")
    private Integer maCauHoi;

    @Column(name = "NoiDungDapAn")
    private String noiDungDapAn;

    @Column(name = "LaDapAnDung")
    private Boolean laDapAnDung;
}