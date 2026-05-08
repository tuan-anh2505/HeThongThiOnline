package com.example.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DapAnDungSai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DapAnDungSai {

    @Id
    @Column(name = "MaCauHoi")
    private Integer maCauHoi;

    @Column(name = "DapAnDung")
    private Boolean dapAnDung;
}