package com.example.exam.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileUploadService {

    @Value("${file.upload.dir:uploads/}")
    private String uploadDir;

    @Value("${file.upload.max-size:52428800}")
    private long maxFileSize; // 50MB by default

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "txt", "jpg", "jpeg", "png", "gif", "zip");

    private static final List<String> EXAM_MATERIAL_EXTENSIONS = Arrays.asList(
            "pdf", "doc", "docx", "ppt", "pptx", "txt", "jpg", "png");

    /**
     * Upload exam material file
     * 
     * @param file     uploaded file
     * @param maBaiThi exam ID
     * @return uploaded file path
     * @throws IOException if file upload fails
     */
    public String uploadExamMaterial(MultipartFile file, Integer maBaiThi) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        String fileExtension = getFileExtension(file.getOriginalFilename());
        if (!EXAM_MATERIAL_EXTENSIONS.contains(fileExtension.toLowerCase())) {
            throw new RuntimeException("Định dạng file không được hỗ trợ");
        }

        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("Kích thước file vượt quá giới hạn");
        }

        String fileName = generateUniqueFileName(maBaiThi, fileExtension);
        Path filePath = Paths.get(uploadDir, "exams", String.valueOf(maBaiThi), fileName);

        createDirectories(filePath);
        Files.write(filePath, file.getBytes());

        log.info("Exam material uploaded: {}", filePath);
        return filePath.toString();
    }

    /**
     * Upload student submission file
     * 
     * @param file     uploaded file
     * @param maBaiLam student submission ID
     * @return uploaded file path
     * @throws IOException if file upload fails
     */
    public String uploadStudentSubmission(MultipartFile file, Integer maBaiLam) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        String fileExtension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase())) {
            throw new RuntimeException("Định dạng file không được hỗ trợ");
        }

        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("Kích thước file vượt quá giới hạn");
        }

        String fileName = generateUniqueFileName(maBaiLam, fileExtension);
        Path filePath = Paths.get(uploadDir, "submissions", String.valueOf(maBaiLam), fileName);

        createDirectories(filePath);
        Files.write(filePath, file.getBytes());

        log.info("Student submission uploaded: {}", filePath);
        return filePath.toString();
    }

    /**
     * Upload teacher resource file
     * 
     * @param file        uploaded file
     * @param maGiangVien teacher ID
     * @return uploaded file path
     * @throws IOException if file upload fails
     */
    public String uploadTeacherResource(MultipartFile file, Integer maGiangVien) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        String fileExtension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase())) {
            throw new RuntimeException("Định dạng file không được hỗ trợ");
        }

        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("Kích thước file vượt quá giới hạn");
        }

        String fileName = generateUniqueFileName(maGiangVien, fileExtension);
        Path filePath = Paths.get(uploadDir, "resources", String.valueOf(maGiangVien), fileName);

        createDirectories(filePath);
        Files.write(filePath, file.getBytes());

        log.info("Teacher resource uploaded: {}", filePath);
        return filePath.toString();
    }

    /**
     * Delete uploaded file
     * 
     * @param filePath path to file
     * @return true if deletion successful
     */
    public boolean deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted: {}", filePath);
                return true;
            }
        } catch (IOException e) {
            log.error("Failed to delete file: " + filePath, e);
        }
        return false;
    }

    /**
     * Get file bytes for download
     * 
     * @param filePath path to file
     * @return file bytes
     * @throws IOException if file read fails
     */
    public byte[] getFileBytes(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            throw new RuntimeException("File không tồn tại");
        }
        return Files.readAllBytes(path);
    }

    /**
     * Check if file exists
     * 
     * @param filePath path to file
     * @return true if file exists
     */
    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }

    /**
     * Get file size in KB
     * 
     * @param filePath path to file
     * @return file size in KB
     */
    public long getFileSize(String filePath) {
        try {
            Path path = Paths.get(filePath);
            return Files.size(path) / 1024;
        } catch (IOException e) {
            log.error("Failed to get file size: " + filePath, e);
            return 0;
        }
    }

    // Helper methods

    private String generateUniqueFileName(Integer id, String extension) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        return timestamp + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    private void createDirectories(Path filePath) throws IOException {
        Path directory = filePath.getParent();
        if (directory != null && !Files.exists(directory)) {
            Files.createDirectories(directory);
            log.info("Directory created: {}", directory);
        }
    }
}
