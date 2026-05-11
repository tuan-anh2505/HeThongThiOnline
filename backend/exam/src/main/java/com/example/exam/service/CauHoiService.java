package com.example.exam.service;

import com.example.exam.entity.CauHoi;
import com.example.exam.entity.NganHangCauHoi;
import com.example.exam.repository.CauHoiRepository;
import com.example.exam.repository.NganHangCauHoiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CauHoiService {

    private final CauHoiRepository cauHoiRepository;
    private final NganHangCauHoiRepository nganHangRepository;

    public List<CauHoi> getQuestionsByExam(Integer maBaiThi) {
        // TODO: Implement logic to get questions for an exam
        return cauHoiRepository.findAll();
    }

    public List<CauHoi> getQuestionsByNganHang(Integer maNganHang) {
        return cauHoiRepository.findAll().stream()
                .filter(q -> q.getMaNganHang().equals(maNganHang))
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
}
