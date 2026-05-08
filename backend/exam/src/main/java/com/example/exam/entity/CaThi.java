package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "CaThi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaThi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaCaThi")
    private Integer maCaThi;

    @Column(name = "TenCaThi")
    private String tenCaThi;

    @Column(name = "GioBatDau")
    private LocalDateTime gioBatDau;

    @Column(name = "GioKetThuc")
    private LocalDateTime gioKetThuc;
}