package com.example.exam.service;

import com.example.exam.entity.*;
import com.example.exam.repository.*;
import com.example.exam.util.ExamDeadlineUtil;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final BaiLamRepository baiLamRepository;
    private final BaiThiRepository baiThiRepository;
    private final SinhVienRepository sinhVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final CaThiRepository caThiRepository;
    private final ExamDeadlineUtil deadlineUtil;

    /**
     * Export exam results to CSV format
     * 
     * @param maBaiThi exam ID
     * @return CSV data as byte array
     */
    public byte[] exportExamResultsToCSV(Integer maBaiThi) throws IOException {
        BaiThi baiThi = baiThiRepository.findById(maBaiThi)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<BaiLam> submissions = baiLamRepository.findByMaBaiThi(maBaiThi);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        CSVFormat csvFormat = CSVFormat.DEFAULT.withHeader("Mã Sinh Viên", "Tên Sinh Viên", "Điểm", "Thời Gian Nộp");

        try (CSVPrinter printer = new CSVPrinter(new PrintWriter(baos), csvFormat)) {
            for (BaiLam submission : submissions) {
                SinhVien student = sinhVienRepository.findById(submission.getMaSinhVien()).orElse(null);
                TaiKhoan account = null;
                if (student != null) {
                    account = taiKhoanRepository.findById(student.getMaTaiKhoan()).orElse(null);
                }

                String studentName = account != null ? account.getHoTen() : "Unknown";
                String studentId = student != null ? student.getMaSoSinhVien() : "N/A";
                String score = submission.getDiemTong() != null ? submission.getDiemTong().toString() : "0";
                String submitTime = submission.getThoiGianNop() != null ? submission.getThoiGianNop().toString()
                        : "N/A";

                printer.printRecord(studentId, studentName, score, submitTime);
            }
            printer.flush();
        }

        return baos.toByteArray();
    }

    /**
     * Export exam statistics to CSV format
     * 
     * @param maBaiThi exam ID
     * @return CSV data as byte array
     */
    public byte[] exportExamStatisticsToCSV(Integer maBaiThi) throws IOException {
        BaiThi baiThi = baiThiRepository.findById(maBaiThi)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<BaiLam> submissions = baiLamRepository.findByMaBaiThi(maBaiThi);

        double avgScore = submissions.stream()
                .mapToDouble(bl -> bl.getDiemTong() != null ? bl.getDiemTong().doubleValue() : 0)
                .average()
                .orElse(0.0);

        long passCount = submissions.stream()
                .filter(bl -> bl.getDiemTong() != null && bl.getDiemTong().doubleValue() >= 5)
                .count();

        long totalCount = submissions.size();
        double passRate = totalCount > 0 ? (passCount * 100.0 / totalCount) : 0;

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(baos)) {
            writer.println("Thống Kê Bài Thi");
            writer.println("================");
            writer.println("Tên bài thi: " + baiThi.getTenBaiThi());
            writer.println("Tổng số sinh viên làm: " + totalCount);
            writer.println("Số sinh viên đạt: " + passCount);
            writer.println("Tỷ lệ đạt: " + String.format("%.2f%%", passRate));
            writer.println("Điểm trung bình: " + String.format("%.2f", avgScore));
            writer.println("Điểm cao nhất: " + (submissions.isEmpty() ? "N/A"
                    : submissions.stream()
                            .mapToDouble(bl -> bl.getDiemTong() != null ? bl.getDiemTong().doubleValue() : 0)
                            .max().orElse(0)));
            writer.println("Điểm thấp nhất: " + (submissions.isEmpty() ? "N/A"
                    : submissions.stream()
                            .mapToDouble(bl -> bl.getDiemTong() != null ? bl.getDiemTong().doubleValue() : 0)
                            .min().orElse(0)));
            writer.flush();
        }

        return baos.toByteArray();
    }

    /**
     * Export exam details to text format
     * 
     * @param maBaiThi exam ID
     * @return formatted text data as byte array
     */
    public byte[] exportExamDetailsToText(Integer maBaiThi) throws IOException {
        BaiThi baiThi = baiThiRepository.findById(maBaiThi)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        CaThi caThi = caThiRepository.findById(baiThi.getMaCaThi()).orElse(null);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(baos)) {
            writer.println("Chi Tiết Bài Thi");
            writer.println("================");
            writer.println("Tên bài thi: " + baiThi.getTenBaiThi());
            writer.println("Thời lượng: " + baiThi.getThoiLuong() + " phút");
            writer.println("Ngày tạo: " + baiThi.getNgayTao());

            if (caThi != null) {
                writer.println("\nThông Tin Ca Thi");
                writer.println("Tên ca thi: " + caThi.getTenCaThi());
                writer.println("Giờ bắt đầu: " + caThi.getGioBatDau());
                writer.println("Giờ kết thúc: " + caThi.getGioKetThuc());
                writer.println("Trạng thái: " + (deadlineUtil.isExamStillValid(caThi) ? "Còn hạn" : "Hết hạn"));
            }

            writer.flush();
        }

        return baos.toByteArray();
    }
}
