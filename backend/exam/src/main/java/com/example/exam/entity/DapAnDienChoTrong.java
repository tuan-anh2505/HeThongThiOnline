package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DapAnDienChoTrong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DapAnDienChoTrong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDapAn")
    private Integer maDapAn;

    @Column(name = "MaCauHoi")
    private Integer maCauHoi;

    @Column(name = "TuKhoaDung")
    private String tuKhoaDung;
}