package com.example.exam.controller;

import com.example.exam.dto.ExamAnalyticsResponse;
import com.example.exam.service.DashboardService;
import com.example.exam.service.LoggingService;
import com.example.exam.service.ExportService;
import com.example.exam.security.TokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TeacherAnalyticsController {

    private final DashboardService dashboardService;
    private final LoggingService loggingService;
    private final ExportService exportService;
    private final TokenUtil tokenUtil;

    @GetMapping("/exam/{maBaiThi}")
    public ResponseEntity<ExamAnalyticsResponse> getExamAnalytics(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token != null) {
                String username = tokenUtil.extractUsernameFromAuthHeader(token);
                // Log analytics access
                loggingService.logAction(0, "VIEW_ANALYTICS_EXAM_" + maBaiThi, "");
            }
            ExamAnalyticsResponse analytics = dashboardService.getExamAnalytics(maBaiThi);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/exam/{maBaiThi}/export-csv")
    public ResponseEntity<byte[]> exportExamResultsToCSV(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token != null) {
                loggingService.logAction(0, "EXPORT_EXAM_RESULTS_CSV_" + maBaiThi, "");
            }
            byte[] csvData = exportService.exportExamResultsToCSV(maBaiThi);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"exam_results_" + maBaiThi + ".csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvData);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/exam/{maBaiThi}/export-statistics")
    public ResponseEntity<byte[]> exportExamStatistics(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token != null) {
                loggingService.logAction(0, "EXPORT_EXAM_STATISTICS_" + maBaiThi, "");
            }
            byte[] statsData = exportService.exportExamStatisticsToCSV(maBaiThi);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"exam_statistics_" + maBaiThi + ".txt\"")
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(statsData);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/exam/{maBaiThi}/export-details")
    public ResponseEntity<byte[]> exportExamDetails(
            @PathVariable Integer maBaiThi,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token != null) {
                loggingService.logAction(0, "EXPORT_EXAM_DETAILS_" + maBaiThi, "");
            }
            byte[] detailsData = exportService.exportExamDetailsToText(maBaiThi);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"exam_details_" + maBaiThi + ".txt\"")
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(detailsData);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
