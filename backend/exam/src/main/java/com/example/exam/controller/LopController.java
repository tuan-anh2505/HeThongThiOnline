package com.example.exam.controller;

import com.example.exam.entity.Lop;
import com.example.exam.repository.LopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lop")
@RequiredArgsConstructor
@CrossOrigin("*")
public class LopController {

    private final LopRepository lopRepository;

    @GetMapping
    public ResponseEntity<List<Lop>> getAll() {
        return ResponseEntity.ok(lopRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Lop> create(@RequestBody Lop lop) {
        return ResponseEntity.ok(lopRepository.save(lop));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lop> update(@PathVariable Integer id, @RequestBody Lop details) {
        if (!lopRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        details.setMaLop(id); // Đảm bảo ghi đè đúng ID
        return ResponseEntity.ok(lopRepository.save(details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (lopRepository.existsById(id)) {
            lopRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}