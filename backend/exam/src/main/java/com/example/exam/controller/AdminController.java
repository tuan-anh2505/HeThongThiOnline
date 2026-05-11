package com.example.exam.controller;

import com.example.exam.dto.AdminUserResponse;
import com.example.exam.entity.TaiKhoan;
import com.example.exam.entity.NhatKyHeThong;
import com.example.exam.service.AdminService;
import com.example.exam.service.LoggingService;
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
    public ResponseEntity<String> getAllLogs(
            @RequestHeader(value = "X-Admin-ID", required = false) Integer adminId) {
        if (adminId != null) {
            loggingService.logAction(adminId, "VIEW_ALL_LOGS", "");
        }
        // TODO: Implement get all logs
        return ResponseEntity.ok("All logs");
    }
}
