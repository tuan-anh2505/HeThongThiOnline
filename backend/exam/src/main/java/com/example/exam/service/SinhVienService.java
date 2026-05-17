package com.example.exam.service;

import com.example.exam.entity.SinhVien;
import com.example.exam.entity.GiangVien;
import com.example.exam.repository.SinhVienRepository;
import com.example.exam.repository.GiangVienRepository;
import com.example.exam.repository.LopRepository;
import com.example.exam.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SinhVienService {

    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final LopRepository lopRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    public SinhVien getSinhVienByUsername(String username) {
        return taiKhoanRepository.findByTenDangNhap(username)
                .flatMap(tk -> sinhVienRepository.findByMaTaiKhoan(tk.getMaTaiKhoan()))
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại"));
    }

    public GiangVien getGiangVienByUsername(String username) {
        return taiKhoanRepository.findByTenDangNhap(username)
                .flatMap(tk -> giangVienRepository.findByMaTaiKhoan(tk.getMaTaiKhoan()))
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại"));
    }

    public Integer getLopIdFromTenLop(String tenLop) {
        return lopRepository.findByTenLop(tenLop)
                .map(lop -> lop.getMaLop())
                .orElseThrow(() -> new RuntimeException("Lop khong ton tai"));
    }

    public SinhVien createStudent(SinhVien sinhVien) {
        return sinhVienRepository.save(sinhVien);
    }

    public Optional<SinhVien> getStudentById(Integer maSinhVien) {
        return sinhVienRepository.findById(maSinhVien);
    }
}
