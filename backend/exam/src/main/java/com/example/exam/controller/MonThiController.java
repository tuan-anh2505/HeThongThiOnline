package com.example.exam.controller;

import com.example.exam.entity.MonThi;
import com.example.exam.repository.MonThiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monthi")
@RequiredArgsConstructor
@CrossOrigin("*") // Rất quan trọng để React không bị chặn
public class MonThiController {

    private final MonThiRepository monThiRepository;

    @GetMapping
    public ResponseEntity<List<MonThi>> getAll() {
        return ResponseEntity.ok(monThiRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<MonThi> create(@RequestBody MonThi monThi) {
        return ResponseEntity.ok(monThiRepository.save(monThi));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MonThi> update(@PathVariable Integer id, @RequestBody MonThi details) {
        if (!monThiRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        details.setMaMonThi(id); // Đảm bảo ghi đè đúng ID
        return ResponseEntity.ok(monThiRepository.save(details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (monThiRepository.existsById(id)) {
            monThiRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}