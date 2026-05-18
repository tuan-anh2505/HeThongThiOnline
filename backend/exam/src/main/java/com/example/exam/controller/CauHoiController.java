package com.example.exam.controller;

import com.example.exam.entity.CauHoi;
import com.example.exam.entity.DapAnTracNghiem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/cauhoi")
@CrossOrigin("*")
public class CauHoiController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. LẤY DANH SÁCH
    @GetMapping
    public ResponseEntity<?> getAllCauHoi() {
        String sql = "SELECT ma_cau_hoi AS maCauHoi, ma_ngan_hang AS maNganHang, noi_dung AS noiDung, loai_cau_hoi AS loaiCauHoi, diem AS diem FROM cau_hoi ORDER BY ma_cau_hoi DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    // 2. LẤY CHI TIẾT 1 CÂU HỎI
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            String sqlCauHoi = "SELECT ma_cau_hoi AS maCauHoi, ma_ngan_hang AS maNganHang, noi_dung AS noiDung, loai_cau_hoi AS loaiCauHoi, diem AS diem FROM cau_hoi WHERE ma_cau_hoi = ?";
            Map<String, Object> cauHoi = jdbcTemplate.queryForMap(sqlCauHoi, id);

            String sqlDapAn = "SELECT ma_dap_an AS maDapAn, noi_dung_dap_an AS noiDungDapAn, la_dap_an_dung AS laDapAnDung FROM dap_an_trac_nghiem WHERE ma_cau_hoi = ?";
            List<Map<String, Object>> dapAns = jdbcTemplate.queryForList(sqlDapAn, id);

            cauHoi.put("dapAnTracNghiem", dapAns);
            return ResponseEntity.ok(cauHoi);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Không tìm thấy câu hỏi");
        }
    }

    // 3. THÊM MỚI
    @PostMapping
    public ResponseEntity<?> create(@RequestBody CauHoi cauHoi) {
        String sql = "INSERT INTO cau_hoi (ma_ngan_hang, noi_dung, loai_cau_hoi, diem) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, cauHoi.getMaNganHang(), cauHoi.getNoiDung(), cauHoi.getLoaiCauHoi(), cauHoi.getDiem());
        Integer newId = jdbcTemplate.queryForObject("SELECT IDENT_CURRENT('cau_hoi')", BigDecimal.class).intValue();
        saveAnswers(newId, cauHoi.getDapAnTracNghiem());
        return ResponseEntity.ok("Thêm thành công");
    }

    // 4. CẬP NHẬT CÂU HỎI
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody CauHoi cauHoi) {
        try {
            String sqlUpdate = "UPDATE cau_hoi SET ma_ngan_hang = ?, noi_dung = ?, loai_cau_hoi = ?, diem = ? WHERE ma_cau_hoi = ?";
            jdbcTemplate.update(sqlUpdate, cauHoi.getMaNganHang(), cauHoi.getNoiDung(), cauHoi.getLoaiCauHoi(), cauHoi.getDiem(), id);
            jdbcTemplate.update("DELETE FROM dap_an_trac_nghiem WHERE ma_cau_hoi = ?", id);
            saveAnswers(id, cauHoi.getDapAnTracNghiem());
            return ResponseEntity.ok("Cập nhật thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // 5. XÓA
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        jdbcTemplate.update("DELETE FROM dap_an_trac_nghiem WHERE ma_cau_hoi = ?", id);
        jdbcTemplate.update("DELETE FROM cau_hoi WHERE ma_cau_hoi = ?", id);
        return ResponseEntity.ok("Xóa thành công");
    }

    // Hàm phụ trợ lưu đáp án
    private void saveAnswers(Integer questionId, List<DapAnTracNghiem> list) {
        if (list == null) return;
        String sql = "INSERT INTO dap_an_trac_nghiem (ma_cau_hoi, noi_dung_dap_an, la_dap_an_dung) VALUES (?, ?, ?)";
        for (DapAnTracNghiem da : list) {
            jdbcTemplate.update(sql, questionId, da.getNoiDungDapAn(), da.getLaDapAnDung());
        }
    }
}