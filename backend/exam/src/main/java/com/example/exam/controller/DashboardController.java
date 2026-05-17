package com.example.exam.controller;

import com.example.exam.dto.DashboardResponse;
import com.example.exam.dto.ExamResponse;
import com.example.exam.service.DashboardService;
import com.example.exam.service.SinhVienService;
import com.example.exam.security.TokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SinhVienService sinhVienService;
    private final TokenUtil tokenUtil;

    @GetMapping("/student")
    public ResponseEntity<DashboardResponse> getStudentDashboard(@RequestHeader("Authorization") String token) {
        try {
            String username = tokenUtil.extractUsernameFromAuthHeader(token);
            Integer maSinhVien = sinhVienService.getSinhVienByUsername(username).getMaSinhVien();

            List<String> classes = dashboardService.getStudentClasses(maSinhVien);
            String selectedClass = classes.isEmpty() ? null : classes.get(0);

            List<ExamResponse> allExams = classes.isEmpty() ? List.of()
                    : dashboardService.getStudentExamsForClass(
                            maSinhVien,
                            sinhVienService.getLopIdFromTenLop(selectedClass));

            List<ExamResponse> examsValid = allExams.stream()
                    .filter(exam -> exam.getConHan() != null && exam.getConHan())
                    .toList();

            List<ExamResponse> examsExpired = allExams.stream()
                    .filter(exam -> exam.getConHan() == null || !exam.getConHan())
                    .toList();

            return ResponseEntity.ok(DashboardResponse.builder()
                    .examsValid(examsValid)
                    .examsExpired(examsExpired)
                    .classes(classes)
                    .selectedClass(selectedClass)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/teacher")
    public ResponseEntity<DashboardResponse> getTeacherDashboard(@RequestHeader("Authorization") String token) {
        try {
            String username = tokenUtil.extractUsernameFromAuthHeader(token);
            Integer maGiangVien = sinhVienService.getGiangVienByUsername(username).getMaGiangVien();

            List<ExamResponse> allExams = dashboardService.getTeacherExams(maGiangVien);

            List<ExamResponse> examsValid = allExams.stream()
                    .filter(exam -> exam.getConHan() != null && exam.getConHan())
                    .toList();

            List<ExamResponse> examsExpired = allExams.stream()
                    .filter(exam -> exam.getConHan() == null || !exam.getConHan())
                    .toList();

            return ResponseEntity.ok(DashboardResponse.builder()
                    .examsValid(examsValid)
                    .examsExpired(examsExpired)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/exams-by-class/{maLop}")
    public ResponseEntity<List<ExamResponse>> getExamsByClass(@PathVariable Integer maLop) {
        return ResponseEntity.ok(dashboardService.getExamsForClass(maLop));
    }

    @GetMapping("/student/exams-by-class-name/{tenLop}")
    public ResponseEntity<DashboardResponse> getStudentExamsByClassName(
            @PathVariable String tenLop,
            @RequestHeader("Authorization") String token) {
        try {
            String username = tokenUtil.extractUsernameFromAuthHeader(token);
            Integer maSinhVien = sinhVienService.getSinhVienByUsername(username).getMaSinhVien();
            Integer maLop = sinhVienService.getLopIdFromTenLop(tenLop);

            List<ExamResponse> allExams = dashboardService.getStudentExamsForClass(maSinhVien, maLop);

            List<ExamResponse> examsValid = allExams.stream()
                    .filter(exam -> exam.getConHan() != null && exam.getConHan())
                    .toList();

            List<ExamResponse> examsExpired = allExams.stream()
                    .filter(exam -> exam.getConHan() == null || !exam.getConHan())
                    .toList();

            return ResponseEntity.ok(DashboardResponse.builder()
                    .examsValid(examsValid)
                    .examsExpired(examsExpired)
                    .selectedClass(tenLop)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
