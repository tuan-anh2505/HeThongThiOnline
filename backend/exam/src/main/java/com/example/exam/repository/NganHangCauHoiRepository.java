package com.example.exam.repository;

import com.example.exam.entity.NganHangCauHoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NganHangCauHoiRepository extends JpaRepository<NganHangCauHoi, Integer> {
}
