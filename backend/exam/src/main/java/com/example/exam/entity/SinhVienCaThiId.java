package com.example.exam.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SinhVienCaThiId implements Serializable {

    private Integer maSinhVien;
    private Integer maCaThi;
}