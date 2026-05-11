package com.example.exam.service;

import com.example.exam.entity.BaiThi;
import com.example.exam.repository.BaiThiRepository;
import com.example.exam.repository.BaiLamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BaiThiService {

    private final BaiThiRepository baiThiRepository;
    private final BaiLamRepository baiLamRepository;

    public List<BaiThi> getAllExams() {
        return baiThiRepository.findAll();
    }

    public Optional<BaiThi> getExamById(Integer maBaiThi) {
        return baiThiRepository.findById(maBaiThi);
    }

    public BaiThi createExam(BaiThi baiThi) {
        baiThi.setNgayTao(LocalDateTime.now());
        return baiThiRepository.save(baiThi);
    }

    public BaiThi updateExam(Integer maBaiThi, BaiThi baiThi) {
        return baiThiRepository.findById(maBaiThi).map(exam -> {
            if (baiThi.getTenBaiThi() != null) {
                exam.setTenBaiThi(baiThi.getTenBaiThi());
            }
            if (baiThi.getThoiLuong() != null) {
                exam.setThoiLuong(baiThi.getThoiLuong());
            }
            if (baiThi.getMaLop() != null) {
                exam.setMaLop(baiThi.getMaLop());
            }
            if (baiThi.getMaMonThi() != null) {
                exam.setMaMonThi(baiThi.getMaMonThi());
            }
            if (baiThi.getMaCaThi() != null) {
                exam.setMaCaThi(baiThi.getMaCaThi());
            }
            if (baiThi.getMaNganHang() != null) {
                exam.setMaNganHang(baiThi.getMaNganHang());
            }
            return baiThiRepository.save(exam);
        }).orElseThrow(() -> new RuntimeException("Bài thi không tồn tại"));
    }

    public void deleteExam(Integer maBaiThi) {
        baiThiRepository.deleteById(maBaiThi);
    }

    public List<BaiThi> getExamsByClass(Integer maLop) {
        return baiThiRepository.findAll().stream()
                .filter(exam -> exam.getMaLop().equals(maLop))
                .toList();
    }

    public Integer getStudentCountForExam(Integer maBaiThi) {
        return baiLamRepository.findByMaBaiThi(maBaiThi).size();
    }
}
