package com.example.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.exam.entity.Lop;

@Repository
public interface LopRepository extends JpaRepository<Lop, Integer> {
}
