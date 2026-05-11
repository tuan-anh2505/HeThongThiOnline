package com.example.exam.repository;

import com.example.exam.entity.NhatKyHeThong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NhatKyHeThongRepository extends JpaRepository<NhatKyHeThong, Integer> {
    List<NhatKyHeThong> findByMaTaiKhoan(Integer maTaiKhoan);
}
