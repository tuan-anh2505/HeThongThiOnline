package com.example.exam.service;

import com.example.exam.dto.SubmitExamRequest;
import com.example.exam.entity.BaiLam;
import com.example.exam.entity.BaiThi;
import com.example.exam.entity.CaThi;
import com.example.exam.entity.CauHoi;
import com.example.exam.entity.ChiTietBaiLam;
import com.example.exam.entity.DapAnDienChoTrong;
import com.example.exam.entity.DapAnTracNghiem;
import com.example.exam.repository.BaiLamRepository;
import com.example.exam.repository.BaiThiRepository;
import com.example.exam.repository.CaThiRepository;
import com.example.exam.repository.ChiTietBaiLamRepository;
import com.example.exam.util.ExamDeadlineUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BaiLamService {

    private final BaiLamRepository baiLamRepository;
    private final BaiThiRepository baiThiRepository;
    private final CaThiRepository caThiRepository;
    private final ChiTietBaiLamRepository chiTietBaiLamRepository;
    private final CauHoiService cauHoiService;
    private final ExamDeadlineUtil deadlineUtil;
    private final ObjectMapper objectMapper;

    public BaiLam startExam(Integer maSinhVien, Integer maBaiThi) {
        // ĐÃ CẬP NHẬT GỌI HÀM findFirstBy...
        Optional<BaiLam> existing = baiLamRepository.findFirstByMaBaiThiAndMaSinhVien(maBaiThi, maSinhVien);
        if (existing.isPresent()) {
            BaiLam baiLam = existing.get();
            if (baiLam.getThoiGianNop() != null) {
                throw new RuntimeException("Bai thi da duoc nop");
            }
            return baiLam;
        }

        validateCanStartExam(maBaiThi);

        BaiLam baiLam = BaiLam.builder()
                .maSinhVien(maSinhVien)
                .maBaiThi(maBaiThi)
                .thoiGianBatDau(LocalDateTime.now())
                .build();

        return baiLamRepository.save(baiLam);
    }

    @Transactional
    public BaiLam submitExam(Integer maBaiLam, SubmitExamRequest request) {
        BaiLam baiLam = baiLamRepository.findById(maBaiLam)
                .orElseThrow(() -> new RuntimeException("Bai lam khong ton tai"));

        if (baiLam.getThoiGianNop() != null) {
            throw new RuntimeException("Bai thi da duoc nop");
        }

        Map<String, Object> answers = request != null && request.getAnswers() != null
                ? request.getAnswers()
                : Map.of();

        List<CauHoi> questions = cauHoiService.getQuestionsWithCorrectAnswersByExam(baiLam.getMaBaiThi());
        BigDecimal rawScore = BigDecimal.ZERO;
        BigDecimal maxScore = BigDecimal.ZERO;

        for (CauHoi question : questions) {
            BigDecimal questionMax = question.getDiem() != null ? question.getDiem() : BigDecimal.ONE;
            BigDecimal point = gradeQuestion(question, answers.get(String.valueOf(question.getMaCauHoi())));

            rawScore = rawScore.add(point);
            maxScore = maxScore.add(questionMax);

            chiTietBaiLamRepository.save(ChiTietBaiLam.builder()
                    .maBaiLam(maBaiLam)
                    .maCauHoi(question.getMaCauHoi())
                    .cauTraLoi(serializeAnswer(answers.get(String.valueOf(question.getMaCauHoi()))))
                    .diemDatDuoc(point)
                    .build());
        }

        BigDecimal diem10 = maxScore.compareTo(BigDecimal.ZERO) > 0
                ? rawScore.multiply(BigDecimal.TEN).divide(maxScore, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        baiLam.setThoiGianNop(LocalDateTime.now());
        baiLam.setDiemTong(diem10);
        return baiLamRepository.save(baiLam);
    }

    public Optional<BaiLam> getSubmittedExam(Integer maBaiThi, Integer maSinhVien) {
        // ĐÃ CẬP NHẬT
        return baiLamRepository.findFirstByMaBaiThiAndMaSinhVien(maBaiThi, maSinhVien);
    }

    public List<BaiLam> getSubmissionsByExam(Integer maBaiThi) {
        return baiLamRepository.findByMaBaiThi(maBaiThi);
    }

    public List<BaiLam> getSubmissionsByStudent(Integer maSinhVien) {
        return baiLamRepository.findByMaSinhVien(maSinhVien);
    }

    public List<BaiLam> getBaiLamByMaSinhVien(Integer maSinhVien) {
        return baiLamRepository.findByMaSinhVien(maSinhVien);
    }

    public List<BaiLam> getAllBaiLam() {
        return baiLamRepository.findAll();
    }

    public boolean hasStudentSubmittedExam(Integer maBaiThi, Integer maSinhVien) {
        // ĐÃ CẬP NHẬT
        return baiLamRepository.findFirstByMaBaiThiAndMaSinhVien(maBaiThi, maSinhVien)
                .map(baiLam -> baiLam.getThoiGianNop() != null)
                .orElse(false);
    }

    public long getRemainingTimeSeconds(Integer maBaiThi, Integer maSinhVien) {
        BaiThi baiThi = baiThiRepository.findById(maBaiThi)
                .orElseThrow(() -> new RuntimeException("Bai thi khong ton tai"));

        LocalDateTime endAt = caThiRepository.findById(baiThi.getMaCaThi())
                .map(CaThi::getGioKetThuc)
                .orElse(null);

        if (maSinhVien != null) {
            // ĐÃ CẬP NHẬT
            Optional<BaiLam> baiLam = baiLamRepository.findFirstByMaBaiThiAndMaSinhVien(maBaiThi, maSinhVien);
            if (baiLam.isPresent() && baiLam.get().getThoiGianBatDau() != null && baiThi.getThoiLuong() != null) {
                LocalDateTime durationEnd = baiLam.get().getThoiGianBatDau().plusMinutes(baiThi.getThoiLuong());
                endAt = endAt == null || durationEnd.isBefore(endAt) ? durationEnd : endAt;
            }
        }

        if (endAt == null) {
            return Long.MAX_VALUE;
        }

        long seconds = java.time.Duration.between(LocalDateTime.now(), endAt).getSeconds();
        return Math.max(seconds, 0);
    }

    private void validateCanStartExam(Integer maBaiThi) {
        BaiThi baiThi = baiThiRepository.findById(maBaiThi)
                .orElseThrow(() -> new RuntimeException("Bai thi khong ton tai"));

        CaThi caThi = caThiRepository.findById(baiThi.getMaCaThi()).orElse(null);
        if (caThi != null && !deadlineUtil.canTakeExam(caThi)) {
            throw new RuntimeException("Bai thi chua mo hoac da het han");
        }
    }

    private BigDecimal gradeQuestion(CauHoi question, Object answer) {
        if (answer == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal maxScore = question.getDiem() != null ? question.getDiem() : BigDecimal.ONE;
        return switch (question.getLoaiCauHoi()) {
            case 1 -> gradeTracNghiem(question, answer, maxScore);
            case 2 -> gradeDungSai(question, answer, maxScore);
            case 3 -> gradeGhepTu(question, answer, maxScore);
            case 4 -> gradeDienChoTrong(question, answer, maxScore);
            default -> BigDecimal.ZERO;
        };
    }

    private BigDecimal gradeTracNghiem(CauHoi question, Object answer, BigDecimal maxScore) {
        Integer selectedId = toInteger(answer);
        if (selectedId == null) {
            return BigDecimal.ZERO;
        }

        return question.getDapAnTracNghiem().stream()
                .filter(answerOption -> Boolean.TRUE.equals(answerOption.getLaDapAnDung()))
                .findFirst()
                .map(correct -> correct.getMaDapAn().equals(selectedId) ? maxScore : BigDecimal.ZERO)
                .orElse(BigDecimal.ZERO);
    }

    private BigDecimal gradeDungSai(CauHoi question, Object answer, BigDecimal maxScore) {
        if (question.getDapAnDungSai() == null || question.getDapAnDungSai().getDapAnDung() == null) {
            return BigDecimal.ZERO;
        }
        return question.getDapAnDungSai().getDapAnDung().equals(toBoolean(answer)) ? maxScore : BigDecimal.ZERO;
    }

    private BigDecimal gradeGhepTu(CauHoi question, Object answer, BigDecimal maxScore) {
        if (!(answer instanceof Map<?, ?> answerMap) || question.getDapAnGhepTu().isEmpty()) {
            return BigDecimal.ZERO;
        }

        long correct = question.getDapAnGhepTu().stream()
                .filter(pair -> {
                    Object selected = answerMap.get(String.valueOf(pair.getMaGhep()));
                    if (selected == null) {
                        selected = answerMap.get(pair.getMaGhep());
                    }
                    return pair.getVePhai().equals(String.valueOf(selected));
                })
                .count();

        return maxScore.multiply(BigDecimal.valueOf(correct))
                .divide(BigDecimal.valueOf(question.getDapAnGhepTu().size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal gradeDienChoTrong(CauHoi question, Object answer, BigDecimal maxScore) {
        if (!(answer instanceof List<?> filled) || question.getDapAnDienChoTrong().isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<DapAnDienChoTrong> correctAnswers = question.getDapAnDienChoTrong();
        int correct = 0;
        for (int i = 0; i < correctAnswers.size(); i++) {
            String expected = normalize(correctAnswers.get(i).getTuKhoaDung());
            String actual = i < filled.size() ? normalize(String.valueOf(filled.get(i))) : "";
            if (expected.equals(actual)) {
                correct++;
            }
        }

        return maxScore.multiply(BigDecimal.valueOf(correct))
                .divide(BigDecimal.valueOf(correctAnswers.size()), 2, RoundingMode.HALF_UP);
    }

    private Integer toInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return value != null ? Integer.parseInt(String.valueOf(value)) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean toBoolean(Object value) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        return value != null ? Boolean.parseBoolean(String.valueOf(value)) : null;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private String serializeAnswer(Object answer) {
        if (answer == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(answer);
        } catch (JsonProcessingException e) {
            return String.valueOf(answer);
        }
    }
}