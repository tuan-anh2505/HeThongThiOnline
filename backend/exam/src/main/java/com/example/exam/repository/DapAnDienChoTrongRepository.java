package com.example.exam.repository;

import com.example.exam.entity.DapAnDienChoTrong;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DapAnDienChoTrongRepository extends JpaRepository<DapAnDienChoTrong, Integer> {
    List<DapAnDienChoTrong> findByMaCauHoi(Integer maCauHoi);
}
