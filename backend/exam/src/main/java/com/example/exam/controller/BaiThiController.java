package com.example.exam.controller;

import com.example.exam.entity.BaiThi;
import com.example.exam.service.BaiThiService;
import com.example.exam.service.LoggingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/baithi")
@RequiredArgsConstructor
@CrossOrigin("*")
public class BaiThiController {

    private final BaiThiService baiThiService;
    private final LoggingService loggingService;

    @GetMapping
    public ResponseEntity<List<BaiThi>> getAllExams() {
        return ResponseEntity.ok(baiThiService.getAllExams());
    }

    @GetMapping("/{maBaiThi}")
    public ResponseEntity<BaiThi> getExamById(@PathVariable Integer maBaiThi) {
        return baiThiService.getExamById(maBaiThi)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BaiThi> createExam(
            @RequestBody BaiThi baiThi,
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan,
            HttpServletRequest request) {
        BaiThi createdExam = baiThiService.createExam(baiThi);
        if (maTaiKhoan != null) {
            // ĐÃ SỬA: Lấy IP thực tế của Giảng viên thông qua request.getRemoteAddr()
            loggingService.logAction(maTaiKhoan, "CREATE_EXAM_" + createdExam.getMaBaiThi(), request.getRemoteAddr());
        }
        return ResponseEntity.ok(createdExam);
    }

    @PutMapping("/{maBaiThi}")
    public ResponseEntity<BaiThi> updateExam(
            @PathVariable Integer maBaiThi,
            @RequestBody BaiThi baiThi,
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan,
            HttpServletRequest request) {
        BaiThi updatedExam = baiThiService.updateExam(maBaiThi, baiThi);
        if (maTaiKhoan != null) {
            // ĐÃ SỬA: Lấy IP thực tế của Giảng viên
            loggingService.logAction(maTaiKhoan, "UPDATE_EXAM_" + maBaiThi, request.getRemoteAddr());
        }
        return ResponseEntity.ok(updatedExam);
    }

    @DeleteMapping("/{maBaiThi}")
    public ResponseEntity<Void> deleteExam(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan,
            HttpServletRequest request) {
        baiThiService.deleteExam(maBaiThi);
        if (maTaiKhoan != null) {
            // ĐÃ SỬA: Lấy IP thực tế của Giảng viên
            loggingService.logAction(maTaiKhoan, "DELETE_EXAM_" + maBaiThi, request.getRemoteAddr());
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/class/{maLop}")
    public ResponseEntity<List<BaiThi>> getExamsByClass(@PathVariable Integer maLop) {
        return ResponseEntity.ok(baiThiService.getExamsByClass(maLop));
    }
}