package com.example.exam.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SinhVienLopId implements Serializable {

    private Integer maSinhVien;
    private Integer maLop;
}