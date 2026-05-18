package com.example.exam.service;

import com.example.exam.entity.NhatKyHeThong;
import com.example.exam.repository.NhatKyHeThongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoggingService {

    private final NhatKyHeThongRepository loggingRepository;

    public void logAction(Integer maTaiKhoan, String action, String diaChiIP) {
        NhatKyHeThong log = NhatKyHeThong.builder()
                .maTaiKhoan(maTaiKhoan)
                .hanhDong(action)
                .thoiGian(LocalDateTime.now())
                .diaChiIP(diaChiIP)
                .build();
        loggingRepository.save(log);
    }

    // ĐÃ BỔ SUNG
    public List<NhatKyHeThong> getAllLogs() {
        return loggingRepository.findAll();
    }

    public List<NhatKyHeThong> getUserActionHistory(Integer maTaiKhoan) {
        return loggingRepository.findByMaTaiKhoan(maTaiKhoan);
    }

    public void logLogin(Integer maTaiKhoan, String diaChiIP) {
        logAction(maTaiKhoan, "LOGIN", diaChiIP);
    }

    public void logLogout(Integer maTaiKhoan, String diaChiIP) {
        logAction(maTaiKhoan, "LOGOUT", diaChiIP);
    }

    public void logCopyPaste(Integer maTaiKhoan, String diaChiIP) {
        logAction(maTaiKhoan, "COPY_PASTE", diaChiIP);
    }

    public void logExamSubmit(Integer maTaiKhoan, Integer maBaiThi, String diaChiIP) {
        logAction(maTaiKhoan, "SUBMIT_EXAM_" + maBaiThi, diaChiIP);
    }

    public void logExamStart(Integer maTaiKhoan, Integer maBaiThi, String diaChiIP) {
        logAction(maTaiKhoan, "START_EXAM_" + maBaiThi, diaChiIP);
    }
}