package com.example.exam.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.exam.entity.Lop;

@Repository
public interface LopRepository extends JpaRepository<Lop, Integer> {
    Optional<Lop> findByTenLop(String tenLop);
}
