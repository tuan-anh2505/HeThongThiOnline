package com.example.exam.service;

import com.example.exam.entity.CauHoi;
import com.example.exam.entity.DapAnDienChoTrong;
import com.example.exam.entity.DapAnDungSai;
import com.example.exam.entity.DapAnGhepTu;
import com.example.exam.entity.DapAnTracNghiem;
import com.example.exam.entity.NganHangCauHoi;
import com.example.exam.repository.BaiThiRepository;
import com.example.exam.repository.CauHoiRepository;
import com.example.exam.repository.DapAnDienChoTrongRepository;
import com.example.exam.repository.DapAnDungSaiRepository;
import com.example.exam.repository.DapAnGhepTuRepository;
import com.example.exam.repository.DapAnTracNghiemRepository;
import com.example.exam.repository.NganHangCauHoiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CauHoiService {

    private final CauHoiRepository cauHoiRepository;
    private final NganHangCauHoiRepository nganHangRepository;
    private final BaiThiRepository baiThiRepository;
    private final DapAnTracNghiemRepository dapAnTracNghiemRepository;
    private final DapAnDungSaiRepository dapAnDungSaiRepository;
    private final DapAnGhepTuRepository dapAnGhepTuRepository;
    private final DapAnDienChoTrongRepository dapAnDienChoTrongRepository;

    public List<CauHoi> getQuestionsByExam(Integer maBaiThi) {
        return getQuestionsWithAnswersByExam(maBaiThi, false);
    }

    public List<CauHoi> getQuestionsWithCorrectAnswersByExam(Integer maBaiThi) {
        return getQuestionsWithAnswersByExam(maBaiThi, true);
    }

    public List<CauHoi> getQuestionsByNganHang(Integer maNganHang) {
        return cauHoiRepository.findByMaNganHang(maNganHang).stream()
                .map(q -> attachAnswers(q, false))
                .toList();
    }

    public CauHoi createQuestion(CauHoi cauHoi) {
        return cauHoiRepository.save(cauHoi);
    }

    public Optional<CauHoi> getQuestionById(Integer maCauHoi) {
        return cauHoiRepository.findById(maCauHoi);
    }

    public void deleteQuestion(Integer maCauHoi) {
        cauHoiRepository.deleteById(maCauHoi);
    }

    public List<NganHangCauHoi> getAllNganHang() {
        return nganHangRepository.findAll();
    }

    public NganHangCauHoi createNganHang(NganHangCauHoi nganHang) {
        return nganHangRepository.save(nganHang);
    }

    private List<CauHoi> getQuestionsWithAnswersByExam(Integer maBaiThi, boolean includeCorrectAnswers) {
        Integer maNganHang = baiThiRepository.findById(maBaiThi)
                .orElseThrow(() -> new RuntimeException("Bai thi khong ton tai"))
                .getMaNganHang();

        return cauHoiRepository.findByMaNganHang(maNganHang).stream()
                .map(q -> attachAnswers(q, includeCorrectAnswers))
                .toList();
    }

    private CauHoi attachAnswers(CauHoi cauHoi, boolean includeCorrectAnswers) {
        cauHoi.setDapAnTracNghiem(dapAnTracNghiemRepository.findByMaCauHoi(cauHoi.getMaCauHoi()).stream()
                .map(answer -> includeCorrectAnswers ? answer : DapAnTracNghiem.builder()
                        .maDapAn(answer.getMaDapAn())
                        .maCauHoi(answer.getMaCauHoi())
                        .noiDungDapAn(answer.getNoiDungDapAn())
                        .laDapAnDung(null)
                        .build())
                .toList());

        cauHoi.setDapAnDungSai(dapAnDungSaiRepository.findByMaCauHoi(cauHoi.getMaCauHoi())
                .map(answer -> includeCorrectAnswers ? answer : DapAnDungSai.builder()
                        .maCauHoi(answer.getMaCauHoi())
                        .dapAnDung(null)
                        .build())
                .orElse(null));

        List<DapAnGhepTu> ghepTu = dapAnGhepTuRepository.findByMaCauHoi(cauHoi.getMaCauHoi());
        cauHoi.setDapAnGhepTu(includeCorrectAnswers ? ghepTu : maskGhepTuAnswers(ghepTu));

        cauHoi.setDapAnDienChoTrong(dapAnDienChoTrongRepository.findByMaCauHoi(cauHoi.getMaCauHoi()).stream()
                .map(answer -> includeCorrectAnswers ? answer : DapAnDienChoTrong.builder()
                        .maDapAn(answer.getMaDapAn())
                        .maCauHoi(answer.getMaCauHoi())
                        .tuKhoaDung(null)
                        .build())
                .toList());

        return cauHoi;
    }

    private List<DapAnGhepTu> maskGhepTuAnswers(List<DapAnGhepTu> answers) {
        List<String> rightValues = answers.stream().map(DapAnGhepTu::getVePhai).toList();
        List<String> shuffled = new java.util.ArrayList<>(rightValues);
        Collections.shuffle(shuffled);

        return answers.stream()
                .map(answer -> DapAnGhepTu.builder()
                        .maGhep(answer.getMaGhep())
                        .maCauHoi(answer.getMaCauHoi())
                        .veTrai(answer.getVeTrai())
                        .vePhai(shuffled.remove(0))
                        .build())
                .toList();
    }
}
