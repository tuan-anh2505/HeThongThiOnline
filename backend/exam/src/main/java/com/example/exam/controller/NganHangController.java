package com.example.exam.controller;

import com.example.exam.entity.NganHangCauHoi;
import com.example.exam.repository.NganHangCauHoiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nganhang")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NganHangController {

    private final NganHangCauHoiRepository nganHangCauHoiRepository;

    @GetMapping
    public ResponseEntity<List<NganHangCauHoi>> getAll() {
        return ResponseEntity.ok(nganHangCauHoiRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<NganHangCauHoi> create(@RequestBody NganHangCauHoi nganHang) {
        return ResponseEntity.ok(nganHangCauHoiRepository.save(nganHang));
    }
}
