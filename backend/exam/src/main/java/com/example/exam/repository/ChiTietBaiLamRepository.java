package com.example.exam.repository;

import com.example.exam.entity.ChiTietBaiLam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChiTietBaiLamRepository extends JpaRepository<ChiTietBaiLam, Integer> {
    List<ChiTietBaiLam> findByMaBaiLam(Integer maBaiLam);

    void deleteByMaBaiLam(Integer maBaiLam);
}
