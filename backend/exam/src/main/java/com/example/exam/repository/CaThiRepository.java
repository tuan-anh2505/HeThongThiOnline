package com.example.exam.repository;

import com.example.exam.entity.CaThi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaThiRepository extends JpaRepository<CaThi, Integer> {
}
