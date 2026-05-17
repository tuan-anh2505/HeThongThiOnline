package com.example.exam.repository;

import com.example.exam.entity.DapAnTracNghiem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DapAnTracNghiemRepository extends JpaRepository<DapAnTracNghiem, Integer> {
    List<DapAnTracNghiem> findByMaCauHoi(Integer maCauHoi);
}
