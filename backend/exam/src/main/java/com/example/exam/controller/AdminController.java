package com.example.exam.controller;

import com.example.exam.dto.AdminUserResponse;
import com.example.exam.entity.TaiKhoan;
import com.example.exam.entity.NhatKyHeThong;
import com.example.exam.entity.MonThi;
import com.example.exam.entity.Lop;
import com.example.exam.entity.CaThi;
import com.example.exam.service.AdminService;
import com.example.exam.service.LoggingService;
import com.example.exam.repository.MonThiRepository;
import com.example.exam.repository.LopRepository;
import com.example.exam.repository.CaThiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;
    private final LoggingService loggingService;
    
    private final MonThiRepository monThiRepository;
    private final LopRepository lopRepository;
    private final CaThiRepository caThiRepository;

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(
            @RequestHeader(value = "X-User-ID", required = false) Integer maTaiKhoan) {
        if (maTaiKhoan != null) {
            loggingService.logAction(maTaiKhoan, "VIEW_ALL_USERS", "");
        }
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{maTaiKhoan}")
    public ResponseEntity<AdminUserResponse> getUserById(
            @PathVariable Integer maTaiKhoan,
            @RequestHeader(value = "X-Admin-ID", required = false) Integer adminId) {
        if (adminId != null) {
            loggingService.logAction(adminId, "VIEW_USER_" + maTaiKhoan, "");
        }
        return adminService.getUserById(maTaiKhoan)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    public ResponseEntity<AdminUserResponse> createUser(
            @RequestBody TaiKhoan taiKhoan,
            @RequestHeader(value = "X-Admin-ID", required = false) Integer adminId) {
        TaiKhoan createdUser = adminService.createUser(taiKhoan);
        if (adminId != null) {
            loggingService.logAction(adminId, "CREATE_USER_" + createdUser.getMaTaiKhoan(), "");
        }
        return ResponseEntity.ok(AdminUserResponse.builder()
                .maTaiKhoan(createdUser.getMaTaiKhoan())
                .tenDangNhap(createdUser.getTenDangNhap())
                .hoTen(createdUser.getHoTen())
                .email(createdUser.getEmail())
                .soDienThoai(createdUser.getSoDienThoai())
                .vaiTro(createdUser.getVaiTro())
                .ngayTao(createdUser.getNgayTao())
                .build());
    }

    @PutMapping("/users/{maTaiKhoan}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Integer maTaiKhoan,
            @RequestBody TaiKhoan taiKhoan,
            @RequestHeader(value = "X-Admin-ID", required = false) Integer adminId) {
        TaiKhoan updatedUser = adminService.updateUser(maTaiKhoan, taiKhoan);
        if (adminId != null) {
            loggingService.logAction(adminId, "UPDATE_USER_" + maTaiKhoan, "");
        }
        return ResponseEntity.ok(AdminUserResponse.builder()
                .maTaiKhoan(updatedUser.getMaTaiKhoan())
                .tenDangNhap(updatedUser.getTenDangNhap())
                .hoTen(updatedUser.getHoTen())
                .email(updatedUser.getEmail())
                .soDienThoai(updatedUser.getSoDienThoai())
                .vaiTro(updatedUser.getVaiTro())
                .ngayTao(updatedUser.getNgayTao())
                .build());
    }

    @DeleteMapping("/users/{maTaiKhoan}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Integer maTaiKhoan,
            @RequestHeader(value = "X-Admin-ID", required = false) Integer adminId) {
        adminService.deleteUser(maTaiKhoan);
        if (adminId != null) {
            loggingService.logAction(adminId, "DELETE_USER_" + maTaiKhoan, "");
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/logs/{maTaiKhoan}")
    public ResponseEntity<List<NhatKyHeThong>> getUserLogs(
            @PathVariable Integer maTaiKhoan,
            @RequestHeader(value = "X-Admin-ID", required = false) Integer adminId) {
        if (adminId != null) {
            loggingService.logAction(adminId, "VIEW_USER_LOGS_" + maTaiKhoan, "");
        }
        return ResponseEntity.ok(loggingService.getUserActionHistory(maTaiKhoan));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getAllLogs(
            @RequestHeader(value = "X-Admin-ID", required = false) Integer adminId) {
        if (adminId != null) {
            loggingService.logAction(adminId, "VIEW_ALL_LOGS", "");
        }
        return ResponseEntity.ok(loggingService.getAllLogs());
    }

    // ── ĐỒNG BỘ: ĐƯỜNG DẪN MÔN HỌC ĐÃ ĐƯỢC ỦY QUYỀN SECURITY ──
    @GetMapping("/users/monthi")
    public ResponseEntity<List<MonThi>> getAllSubjects() {
        return ResponseEntity.ok(monThiRepository.findAll());
    }

    @PostMapping("/users/monthi")
    public ResponseEntity<MonThi> createSubject(@RequestBody MonThi monThi) {
        return ResponseEntity.ok(monThiRepository.save(monThi));
    }

    @PutMapping("/users/monthi/{id}")
    public ResponseEntity<MonThi> updateSubject(@PathVariable Integer id, @RequestBody MonThi details) {
        if (!monThiRepository.existsById(id)) return ResponseEntity.notFound().build();
        details.setMaMonThi(id);
        return ResponseEntity.ok(monThiRepository.save(details));
    }

    @DeleteMapping("/users/monthi/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Integer id) {
        if (monThiRepository.existsById(id)) {
            monThiRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ── ĐỒNG BỘ: ĐƯỜNG DẪN LỚP HỌC ĐÃ ĐƯỢC ỦY QUYỀN SECURITY ──
    @GetMapping("/users/lop")
    public ResponseEntity<List<Lop>> getAllClasses() {
        return ResponseEntity.ok(lopRepository.findAll());
    }

    @PostMapping("/users/lop")
    public ResponseEntity<Lop> createClass(@RequestBody Lop lop) {
        return ResponseEntity.ok(lopRepository.save(lop));
    }

    @PutMapping("/users/lop/{id}")
    public ResponseEntity<Lop> updateClass(@PathVariable Integer id, @RequestBody Lop details) {
        if (!lopRepository.existsById(id)) return ResponseEntity.notFound().build();
        details.setMaLop(id);
        return ResponseEntity.ok(lopRepository.save(details));
    }

    @DeleteMapping("/users/lop/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Integer id) {
        if (lopRepository.existsById(id)) {
            lopRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ── ĐỒNG BỘ: ĐƯỜNG DẪN CA THI ĐÃ ĐƯỢC ỦY QUYỀN SECURITY ──
    @GetMapping("/users/cathi")
    public ResponseEntity<List<CaThi>> getAllShifts() {
        return ResponseEntity.ok(caThiRepository.findAll());
    }

    @PostMapping("/users/cathi")
    public ResponseEntity<CaThi> createShift(@RequestBody CaThi caThi) {
        return ResponseEntity.ok(caThiRepository.save(caThi));
    }

    @PutMapping("/users/cathi/{id}")
    public ResponseEntity<CaThi> updateShift(@PathVariable Integer id, @RequestBody CaThi details) {
        if (!caThiRepository.existsById(id)) return ResponseEntity.notFound().build();
        details.setMaCaThi(id);
        return ResponseEntity.ok(caThiRepository.save(details));
    }

    @DeleteMapping("/users/cathi/{id}")
    public ResponseEntity<Void> deleteShift(@PathVariable Integer id) {
        if (caThiRepository.existsById(id)) {
            caThiRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}