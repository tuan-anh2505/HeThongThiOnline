package com.example.exam.repository;

import com.example.exam.entity.SinhVienLop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SinhVienLopRepository extends JpaRepository<SinhVienLop, Integer> {
    List<SinhVienLop> findByMaSinhVien(Integer maSinhVien);

    List<SinhVienLop> findByMaLop(Integer maLop);
}
