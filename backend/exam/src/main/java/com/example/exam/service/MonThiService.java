package com.example.exam.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.exam.entity.MonThi;
import com.example.exam.repository.MonThiRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MonThiService {

    private final MonThiRepository monThiRepository;

    public List<MonThi> getAll() {
        return monThiRepository.findAll();
    }

    public MonThi create(MonThi monThi) {

        monThi.setNgayTao(LocalDateTime.now());

        return monThiRepository.save(monThi);
    }
}