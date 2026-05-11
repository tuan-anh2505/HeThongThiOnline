package com.example.exam.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exam.entity.MonThi;
import com.example.exam.service.MonThiService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/monthi")
@RequiredArgsConstructor
@CrossOrigin("*")
public class MonThiController {

    private final MonThiService monThiService;

    @GetMapping
    public ResponseEntity<List<MonThi>> getAll() {
        return ResponseEntity.ok(monThiService.getAll());
    }

    @PostMapping
    public ResponseEntity<MonThi> create(
            @RequestBody MonThi monThi) {
        return ResponseEntity.ok(monThiService.create(monThi));
    }
}