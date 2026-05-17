package com.example.exam.repository;

import com.example.exam.entity.DapAnGhepTu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DapAnGhepTuRepository extends JpaRepository<DapAnGhepTu, Integer> {
    List<DapAnGhepTu> findByMaCauHoi(Integer maCauHoi);
}
