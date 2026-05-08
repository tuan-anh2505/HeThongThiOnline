package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DapAnGhepTu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DapAnGhepTu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaGhep")
    private Integer maGhep;

    @Column(name = "MaCauHoi")
    private Integer maCauHoi;

    @Column(name = "VeTrai")
    private String veTrai;

    @Column(name = "VePhai")
    private String vePhai;
}