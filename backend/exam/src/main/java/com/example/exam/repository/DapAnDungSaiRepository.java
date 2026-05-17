package com.example.exam.repository;

import com.example.exam.entity.DapAnDungSai;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DapAnDungSaiRepository extends JpaRepository<DapAnDungSai, Integer> {
    Optional<DapAnDungSai> findByMaCauHoi(Integer maCauHoi);
}
