package com.example.exam.controller;

import com.example.exam.entity.CaThi;
import com.example.exam.repository.CaThiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cathi")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CaThiController {

    private final CaThiRepository caThiRepository;

    @GetMapping
    public ResponseEntity<List<CaThi>> getAll() {
        return ResponseEntity.ok(caThiRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<CaThi> create(@RequestBody CaThi caThi) {
        return ResponseEntity.ok(caThiRepository.save(caThi));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaThi> update(@PathVariable Integer id, @RequestBody CaThi caThiDetails) {
        if (!caThiRepository.existsById(id)) return ResponseEntity.notFound().build();
        caThiDetails.setMaCaThi(id);
        return ResponseEntity.ok(caThiRepository.save(caThiDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (caThiRepository.existsById(id)) {
            caThiRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}