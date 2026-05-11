package com.example.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.exam.entity.BaiThi;

public interface BaiThiRepository extends JpaRepository<BaiThi, Integer> {
}