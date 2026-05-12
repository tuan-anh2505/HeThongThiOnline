package com.example.exam.controller;

import com.example.exam.service.FileUploadService;
import com.example.exam.service.LoggingService;
import com.example.exam.security.TokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FileUploadController {

    private final FileUploadService fileUploadService;
    private final LoggingService loggingService;
    private final TokenUtil tokenUtil;

    /**
     * Upload exam material
     */
    @PostMapping("/exam-material/{maBaiThi}")
    public ResponseEntity<String> uploadExamMaterial(
            @PathVariable Integer maBaiThi,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String filePath = fileUploadService.uploadExamMaterial(file, maBaiThi);

            if (token != null) {
                loggingService.logAction(0, "UPLOAD_EXAM_MATERIAL_" + maBaiThi, "");
            }

            return ResponseEntity.ok("File uploaded successfully: " + filePath);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("File upload failed: " + e.getMessage());
        }
    }

    /**
     * Upload student submission
     */
    @PostMapping("/submission/{maBaiLam}")
    public ResponseEntity<String> uploadStudentSubmission(
            @PathVariable Integer maBaiLam,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String filePath = fileUploadService.uploadStudentSubmission(file, maBaiLam);

            if (token != null) {
                loggingService.logAction(0, "UPLOAD_SUBMISSION_" + maBaiLam, "");
            }

            return ResponseEntity.ok("File uploaded successfully: " + filePath);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("File upload failed: " + e.getMessage());
        }
    }

    /**
     * Upload teacher resource
     */
    @PostMapping("/teacher-resource/{maGiangVien}")
    public ResponseEntity<String> uploadTeacherResource(
            @PathVariable Integer maGiangVien,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String filePath = fileUploadService.uploadTeacherResource(file, maGiangVien);

            if (token != null) {
                loggingService.logAction(0, "UPLOAD_TEACHER_RESOURCE_" + maGiangVien, "");
            }

            return ResponseEntity.ok("File uploaded successfully: " + filePath);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("File upload failed: " + e.getMessage());
        }
    }

    /**
     * Delete file
     */
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFile(
            @RequestParam String filePath,
            @RequestHeader(value = "Authorization", required = false) String token) {
        boolean deleted = fileUploadService.deleteFile(filePath);

        if (token != null) {
            loggingService.logAction(0, "DELETE_FILE", "");
        }

        if (deleted) {
            return ResponseEntity.ok("File deleted successfully");
        } else {
            return ResponseEntity.badRequest().body("File deletion failed");
        }
    }

    /**
     * Get file info
     */
    @GetMapping("/info")
    public ResponseEntity<String> getFileInfo(@RequestParam String filePath) {
        if (fileUploadService.fileExists(filePath)) {
            long sizeKB = fileUploadService.getFileSize(filePath);
            return ResponseEntity.ok("File size: " + sizeKB + " KB");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Download file
     */
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(
            @RequestParam String filePath,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            byte[] fileBytes = fileUploadService.getFileBytes(filePath);

            if (token != null) {
                loggingService.logAction(0, "DOWNLOAD_FILE", "");
            }

            String fileName = Paths.get(filePath).getFileName().toString();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(fileBytes);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
