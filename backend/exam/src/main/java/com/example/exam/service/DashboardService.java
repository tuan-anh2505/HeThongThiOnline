package com.example.exam.service;

import com.example.exam.dto.ExamAnalyticsResponse;
import com.example.exam.dto.ExamResponse;
import com.example.exam.dto.StudentStatsResponse;
import com.example.exam.entity.BaiLam;
import com.example.exam.entity.BaiThi;
import com.example.exam.entity.Lop;
import com.example.exam.entity.SinhVien;
import com.example.exam.entity.SinhVienLop;
import com.example.exam.entity.TaiKhoan;
import com.example.exam.entity.CaThi;
import com.example.exam.repository.BaiLamRepository;
import com.example.exam.repository.BaiThiRepository;
import com.example.exam.repository.LopRepository;
import com.example.exam.repository.SinhVienRepository;
import com.example.exam.repository.SinhVienLopRepository;
import com.example.exam.repository.MonThiRepository;
import com.example.exam.repository.TaiKhoanRepository;
import com.example.exam.repository.CaThiRepository;
import com.example.exam.util.ExamDeadlineUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BaiThiRepository baiThiRepository;
    private final SinhVienLopRepository sinhVienLopRepository;
    private final LopRepository lopRepository;
    private final SinhVienRepository sinhVienRepository;
    private final BaiLamRepository baiLamRepository;
    private final MonThiRepository monThiRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final CaThiRepository caThiRepository;
    private final ExamDeadlineUtil deadlineUtil;

    public List<String> getStudentClasses(Integer maSinhVien) {
        List<SinhVienLop> sinhVienLops = sinhVienLopRepository.findByMaSinhVien(maSinhVien);
        return sinhVienLops.stream()
                .map(svl -> lopRepository.findById(svl.getMaLop()).map(Lop::getTenLop).orElse(""))
                .collect(Collectors.toList());
    }

    public List<ExamResponse> getExamsForClass(Integer maLop) {
        List<BaiThi> baiThis = baiThiRepository.findAll().stream()
                .filter(exam -> exam.getMaLop().equals(maLop))
                .toList();

        return baiThis.stream()
                .map(this::convertToExamResponse)
                .collect(Collectors.toList());
    }

    public List<ExamResponse> getTeacherExams(Integer maGiangVien) {
        List<BaiThi> allExams = baiThiRepository.findAll();
        return allExams.stream()
                .map(this::convertToExamResponse)
                .collect(Collectors.toList());
    }

    public ExamAnalyticsResponse getExamAnalytics(Integer maBaiThi) {
        BaiThi baiThi = baiThiRepository.findById(maBaiThi)
                .orElseThrow(() -> new RuntimeException("Bài thi không tồn tại"));

        List<BaiLam> submissions = baiLamRepository.findByMaBaiThi(maBaiThi);
        int soSinhVienDaLam = submissions.size();
        int soSinhVienTongCong = (int) sinhVienLopRepository.findByMaLop(baiThi.getMaLop()).stream()
                .map(SinhVienLop::getMaSinhVien).distinct().count();

        double diemTrungBinh = submissions.stream()
                .mapToDouble(bl -> bl.getDiemTong().doubleValue())
                .average()
                .orElse(0.0);

        double tileTracNghiemTrungBinh = submissions.stream()
                .mapToDouble(bl -> bl.getDiemTong().doubleValue() / 10.0 * 100)
                .average()
                .orElse(0.0);

        StudentStatsResponse studentDiemCao = submissions.stream()
                .max((a, b) -> a.getDiemTong().compareTo(b.getDiemTong()))
                .map(bl -> {
                    SinhVien sv = sinhVienRepository.findById(bl.getMaSinhVien()).orElse(null);
                    String tenSinhVien = "Unknown";
                    if (sv != null) {
                        TaiKhoan tk = taiKhoanRepository.findById(sv.getMaTaiKhoan()).orElse(null);
                        if (tk != null) {
                            tenSinhVien = tk.getHoTen();
                        }
                    }
                    return StudentStatsResponse.builder()
                            .tenSinhVien(tenSinhVien)
                            .diem(bl.getDiemTong())
                            .tileLeDung(bl.getDiemTong())
                            .daLam(true)
                            .build();
                })
                .orElse(null);

        return ExamAnalyticsResponse.builder()
                .maBaiThi(maBaiThi)
                .tenBaiThi(baiThi.getTenBaiThi())
                .soSinhVienDaLam(soSinhVienDaLam)
                .soSinhVienTongCong(soSinhVienTongCong)
                .diemTrungBinh(diemTrungBinh)
                .tileTracNghiemTrungBinh(tileTracNghiemTrungBinh)
                .studentDiemCao(studentDiemCao)
                .build();
    }

    private ExamResponse convertToExamResponse(BaiThi baiThi) {
        String monThiName = monThiRepository.findById(baiThi.getMaMonThi())
                .map(mt -> mt.getTenMonThi())
                .orElse("Unknown");

        String lopName = lopRepository.findById(baiThi.getMaLop())
                .map(Lop::getTenLop)
                .orElse("Unknown");

        Integer soSinhVien = baiLamRepository.findByMaBaiThi(baiThi.getMaBaiThi()).size();

        // Check exam deadline
        CaThi caThi = caThiRepository.findById(baiThi.getMaCaThi()).orElse(null);
        Boolean conHan = caThi != null ? deadlineUtil.isExamStillValid(caThi) : true;

        return ExamResponse.builder()
                .maBaiThi(baiThi.getMaBaiThi())
                .tenBaiThi(baiThi.getTenBaiThi())
                .thoiLuong(baiThi.getThoiLuong())
                .ngayTao(baiThi.getNgayTao())
                .soSinhVien(soSinhVien)
                .conHan(conHan) // Now using actual deadline check
                .tenMonThi(monThiName)
                .tenLop(lopName)
                .build();
    }
}
