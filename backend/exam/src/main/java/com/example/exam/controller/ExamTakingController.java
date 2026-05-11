package com.example.exam.controller;

import com.example.exam.entity.BaiLam;
import com.example.exam.entity.CauHoi;
import com.example.exam.service.BaiLamService;
import com.example.exam.service.CauHoiService;
import com.example.exam.service.LoggingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/exam-taking")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ExamTakingController {

    private final BaiLamService baiLamService;
    private final CauHoiService cauHoiService;
    private final LoggingService loggingService;

    @PostMapping("/start/{maBaiThi}/{maSinhVien}")
    public ResponseEntity<BaiLam> startExam(
            @PathVariable Integer maBaiThi,
            @PathVariable Integer maSinhVien,
            @RequestHeader(value = "X-IP-Address", required = false) String ipAddress) {
        BaiLam baiLam = baiLamService.startExam(maSinhVien, maBaiThi);
        loggingService.logExamStart(maSinhVien, maBaiThi, ipAddress != null ? ipAddress : "");
        return ResponseEntity.ok(baiLam);
    }

    @GetMapping("/questions/{maBaiThi}")
    public ResponseEntity<List<CauHoi>> getExamQuestions(@PathVariable Integer maBaiThi) {
        return ResponseEntity.ok(cauHoiService.getQuestionsByExam(maBaiThi));
    }

    @PostMapping("/submit/{maBaiLam}")
    public ResponseEntity<BaiLam> submitExam(
            @PathVariable Integer maBaiLam,
            @RequestParam BigDecimal diem,
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan,
            @RequestHeader(value = "X-IP-Address", required = false) String ipAddress) {
        BaiLam submittedExam = baiLamService.submitExam(maBaiLam, diem);
        if (maTaiKhoan != null) {
            loggingService.logExamSubmit(maTaiKhoan, submittedExam.getMaBaiThi(), ipAddress != null ? ipAddress : "");
        }
        return ResponseEntity.ok(submittedExam);
    }

    @GetMapping("/{maBaiThi}/{maSinhVien}")
    public ResponseEntity<BaiLam> getExamSubmission(
            @PathVariable Integer maBaiThi,
            @PathVariable Integer maSinhVien) {
        return baiLamService.getSubmittedExam(maBaiThi, maSinhVien)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/check-submitted/{maBaiThi}/{maSinhVien}")
    public ResponseEntity<Boolean> hasSubmitted(
            @PathVariable Integer maBaiThi,
            @PathVariable Integer maSinhVien) {
        boolean hasSubmitted = baiLamService.hasStudentSubmittedExam(maBaiThi, maSinhVien);
        return ResponseEntity.ok(hasSubmitted);
    }

    @PostMapping("/copy-paste-detect")
    public ResponseEntity<Void> detectCopyPaste(
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan,
            @RequestHeader(value = "X-IP-Address", required = false) String ipAddress) {
        if (maTaiKhoan != null) {
            loggingService.logCopyPaste(maTaiKhoan, ipAddress != null ? ipAddress : "");
        }
        return ResponseEntity.ok().build();
    }
}
