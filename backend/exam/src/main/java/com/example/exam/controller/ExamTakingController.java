package com.example.exam.controller;

import com.example.exam.dto.SubmitExamRequest;
import com.example.exam.entity.BaiLam;
import com.example.exam.entity.CauHoi;
import com.example.exam.entity.SinhVien;
import com.example.exam.security.TokenUtil;
import com.example.exam.service.BaiLamService;
import com.example.exam.service.CauHoiService;
import com.example.exam.service.EmailNotificationService;
import com.example.exam.service.LoggingService;
import com.example.exam.service.SinhVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exam-taking")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ExamTakingController {

    private final BaiLamService baiLamService;
    private final CauHoiService cauHoiService;
    private final LoggingService loggingService;
    @SuppressWarnings("unused")
    private final EmailNotificationService emailService;
    private final TokenUtil tokenUtil;
    private final SinhVienService sinhVienService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/start/{maBaiThi}")
    public ResponseEntity<BaiLam> startExamForCurrentStudent(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "X-IP-Address", required = false) String ipAddress,
            @RequestHeader("Authorization") String token) {
        try {
            SinhVien sinhVien = resolveCurrentStudent(token);
            BaiLam baiLam = baiLamService.startExam(sinhVien.getMaSinhVien(), maBaiThi);
            loggingService.logExamStart(sinhVien.getMaTaiKhoan(), maBaiThi, ipAddress != null ? ipAddress : "");

            messagingTemplate.convertAndSend(
                    "/topic/exam/" + maBaiThi + "/students",
                    "Student " + sinhVien.getMaSinhVien() + " started exam");

            return ResponseEntity.ok(baiLam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/start/{maBaiThi}/{maSinhVien}")
    public ResponseEntity<BaiLam> startExam(
            @PathVariable Integer maBaiThi,
            @PathVariable Integer maSinhVien,
            @RequestHeader(value = "X-IP-Address", required = false) String ipAddress,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            SinhVien sinhVien = token != null ? resolveCurrentStudent(token) : null;
            Integer resolvedMaSinhVien = sinhVien != null ? sinhVien.getMaSinhVien() : maSinhVien;
            Integer resolvedMaTaiKhoan = sinhVien != null ? sinhVien.getMaTaiKhoan() : maSinhVien;

            BaiLam baiLam = baiLamService.startExam(resolvedMaSinhVien, maBaiThi);
            loggingService.logExamStart(resolvedMaTaiKhoan, maBaiThi, ipAddress != null ? ipAddress : "");

            messagingTemplate.convertAndSend(
                    "/topic/exam/" + maBaiThi + "/students",
                    "Student " + resolvedMaSinhVien + " started exam");

            return ResponseEntity.ok(baiLam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/questions/{maBaiThi}")
    public ResponseEntity<List<CauHoi>> getExamQuestions(@PathVariable Integer maBaiThi) {
        return ResponseEntity.ok(cauHoiService.getQuestionsByExam(maBaiThi));
    }

    @PostMapping("/submit/{maBaiLam}")
    public ResponseEntity<BaiLam> submitExam(
            @PathVariable Integer maBaiLam,
            @RequestBody SubmitExamRequest request,
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan,
            @RequestHeader(value = "X-IP-Address", required = false) String ipAddress) {
        try {
            BaiLam submittedExam = baiLamService.submitExam(maBaiLam, request);
            if (maTaiKhoan != null) {
                loggingService.logExamSubmit(maTaiKhoan, submittedExam.getMaBaiThi(),
                        ipAddress != null ? ipAddress : "");
            }

            messagingTemplate.convertAndSend(
                    "/topic/exam/" + submittedExam.getMaBaiThi() + "/progress",
                    "Student submitted with score: " + submittedExam.getDiemTong());

            return ResponseEntity.ok(submittedExam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/submission/{maBaiThi}")
    public ResponseEntity<BaiLam> getCurrentStudentSubmission(
            @PathVariable Integer maBaiThi,
            @RequestHeader("Authorization") String token) {
        SinhVien sinhVien = resolveCurrentStudent(token);
        return baiLamService.getSubmittedExam(maBaiThi, sinhVien.getMaSinhVien())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{maBaiThi}/{maSinhVien}")
    public ResponseEntity<BaiLam> getExamSubmission(
            @PathVariable Integer maBaiThi,
            @PathVariable Integer maSinhVien) {
        return baiLamService.getSubmittedExam(maBaiThi, maSinhVien)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/check-submitted/{maBaiThi}")
    public ResponseEntity<Boolean> hasCurrentStudentSubmitted(
            @PathVariable Integer maBaiThi,
            @RequestHeader("Authorization") String token) {
        SinhVien sinhVien = resolveCurrentStudent(token);
        return ResponseEntity.ok(baiLamService.hasStudentSubmittedExam(maBaiThi, sinhVien.getMaSinhVien()));
    }

    @GetMapping("/check-submitted/{maBaiThi}/{maSinhVien}")
    public ResponseEntity<Boolean> hasSubmitted(
            @PathVariable Integer maBaiThi,
            @PathVariable Integer maSinhVien,
            @RequestHeader(value = "Authorization", required = false) String token) {
        Integer resolvedMaSinhVien = token != null ? resolveCurrentStudent(token).getMaSinhVien() : maSinhVien;
        return ResponseEntity.ok(baiLamService.hasStudentSubmittedExam(maBaiThi, resolvedMaSinhVien));
    }

    @PostMapping("/copy-paste-detect")
    public ResponseEntity<Void> detectCopyPaste(
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan,
            @RequestHeader(value = "X-IP-Address", required = false) String ipAddress) {
        if (maTaiKhoan != null) {
            loggingService.logCopyPaste(maTaiKhoan, ipAddress != null ? ipAddress : "");

            messagingTemplate.convertAndSend(
                    "/topic/exam/alerts",
                    "Copy-paste detected for student: " + maTaiKhoan);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/remaining-time/{maBaiThi}")
    public ResponseEntity<Long> getRemainingTime(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "Authorization", required = false) String token) {
        Integer maSinhVien = null;
        if (token != null && !token.isBlank()) {
            maSinhVien = resolveCurrentStudent(token).getMaSinhVien();
        }
        return ResponseEntity.ok(baiLamService.getRemainingTimeSeconds(maBaiThi, maSinhVien));
    }

    private SinhVien resolveCurrentStudent(String token) {
        String username = tokenUtil.extractUsernameFromAuthHeader(token);
        return sinhVienService.getSinhVienByUsername(username);
    }
}
