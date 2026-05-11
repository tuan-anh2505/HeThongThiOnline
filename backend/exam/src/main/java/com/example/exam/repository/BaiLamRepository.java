package com.example.exam.repository;

import com.example.exam.entity.BaiLam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaiLamRepository extends JpaRepository<BaiLam, Integer> {
    List<BaiLam> findByMaBaiThi(Integer maBaiThi);

    List<BaiLam> findByMaSinhVien(Integer maSinhVien);

    Optional<BaiLam> findByMaBaiThiAndMaSinhVien(Integer maBaiThi, Integer maSinhVien);
}
