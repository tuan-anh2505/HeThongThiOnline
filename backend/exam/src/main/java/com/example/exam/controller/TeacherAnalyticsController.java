package com.example.exam.controller;

import com.example.exam.dto.ExamAnalyticsResponse;
import com.example.exam.service.DashboardService;
import com.example.exam.service.LoggingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TeacherAnalyticsController {

    private final DashboardService dashboardService;
    private final LoggingService loggingService;

    @GetMapping("/exam/{maBaiThi}")
    public ResponseEntity<ExamAnalyticsResponse> getExamAnalytics(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan) {
        ExamAnalyticsResponse analytics = dashboardService.getExamAnalytics(maBaiThi);
        if (maTaiKhoan != null) {
            loggingService.logAction(maTaiKhoan, "VIEW_ANALYTICS_EXAM_" + maBaiThi, "");
        }
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/exam/{maBaiThi}/export")
    public ResponseEntity<byte[]> exportExamData(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan) {
        if (maTaiKhoan != null) {
            loggingService.logAction(maTaiKhoan, "EXPORT_EXAM_DATA_" + maBaiThi, "");
        }
        // TODO: Implement export functionality
        return ResponseEntity.ok(new byte[0]);
    }
}
