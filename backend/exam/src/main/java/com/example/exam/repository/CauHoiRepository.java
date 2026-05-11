package com.example.exam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.exam.entity.CauHoi;

public interface CauHoiRepository extends JpaRepository<CauHoi, Integer> {

    List<CauHoi> findByMaNganHang(Integer maNganHang);
}