package com.example.exam.service;

import com.example.exam.entity.BaiLam;
import com.example.exam.repository.BaiLamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BaiLamService {

    private final BaiLamRepository baiLamRepository;

    public BaiLam startExam(Integer maSinhVien, Integer maBaiThi) {
        Optional<BaiLam> existing = baiLamRepository.findByMaBaiThiAndMaSinhVien(maBaiThi, maSinhVien);
        if (existing.isPresent()) {
            return existing.get();
        }

        BaiLam baiLam = BaiLam.builder()
                .maSinhVien(maSinhVien)
                .maBaiThi(maBaiThi)
                .thoiGianBatDau(LocalDateTime.now())
                .build();

        return baiLamRepository.save(baiLam);
    }

    public BaiLam submitExam(Integer maBaiLam, java.math.BigDecimal diem) {
        return baiLamRepository.findById(maBaiLam).map(baiLam -> {
            baiLam.setThoiGianNop(LocalDateTime.now());
            baiLam.setDiemTong(diem);
            return baiLamRepository.save(baiLam);
        }).orElseThrow(() -> new RuntimeException("Bài làm không tồn tại"));
    }

    public Optional<BaiLam> getSubmittedExam(Integer maBaiThi, Integer maSinhVien) {
        return baiLamRepository.findByMaBaiThiAndMaSinhVien(maBaiThi, maSinhVien);
    }

    public List<BaiLam> getSubmissionsByExam(Integer maBaiThi) {
        return baiLamRepository.findByMaBaiThi(maBaiThi);
    }

    public List<BaiLam> getSubmissionsByStudent(Integer maSinhVien) {
        return baiLamRepository.findByMaSinhVien(maSinhVien);
    }

    public boolean hasStudentSubmittedExam(Integer maBaiThi, Integer maSinhVien) {
        return baiLamRepository.findByMaBaiThiAndMaSinhVien(maBaiThi, maSinhVien).isPresent();
    }
}
