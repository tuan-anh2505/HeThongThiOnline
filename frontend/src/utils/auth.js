// ============================================================
//  utils/auth.js
//  Helper kiểm tra vai trò, bảo vệ route, decode JWT
// ============================================================

import { getToken, getVaiTro, getMaTaiKhoan, getHoTen } from "../services/api";

// ── Vai trò constants ─────────────────────────────────────
export const ROLE = {
  ADMIN:    0,
  GIANG_VIEN: 1,
  SINH_VIEN:  2,
};

// ── Kiểm tra đăng nhập ────────────────────────────────────
export function isLoggedIn() {
  return !!getToken();
}

// ── Lấy thông tin user hiện tại ──────────────────────────
export function getCurrentUser() {
  if (!isLoggedIn()) return null;
  return {
    maTaiKhoan: getMaTaiKhoan(),
    hoTen:      getHoTen(),
    vaiTro:     getVaiTro(),
  };
}

// ── Kiểm tra vai trò ─────────────────────────────────────
export const isAdmin     = () => getVaiTro() === ROLE.ADMIN;
export const isGiangVien = () => getVaiTro() === ROLE.GIANG_VIEN;
export const isSinhVien  = () => getVaiTro() === ROLE.SINH_VIEN;

export function getRoleLabel() {
  const map = {
    [ROLE.ADMIN]:      "Quản trị viên",
    [ROLE.GIANG_VIEN]: "Giảng viên",
    [ROLE.SINH_VIEN]:  "Sinh viên",
  };
  return map[getVaiTro()] ?? "Không xác định";
}

export function getRoleIcon() {
  const map = {
    [ROLE.ADMIN]:      "⚙️",
    [ROLE.GIANG_VIEN]: "👨‍🏫",
    [ROLE.SINH_VIEN]:  "👨‍🎓",
  };
  return map[getVaiTro()] ?? "👤";
}

// ── Decode JWT payload (không verify signature) ───────────
export function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// ── Kiểm tra token còn hạn không ─────────────────────────
export function isTokenExpired() {
  const token = getToken();
  if (!token) return true;
  const payload = decodeJWT(token);
  if (!payload?.exp) return false; // không có exp → coi như không hết hạn
  return Date.now() >= payload.exp * 1000;
}

// ── Tự động logout nếu token hết hạn ─────────────────────
export function checkAndLogout(onLogout) {
  if (isTokenExpired()) {
    localStorage.clear();
    onLogout && onLogout();
    return true;
  }
  return false;
}

// ── Guard: redirect nếu không có quyền ───────────────────
/**
 * Dùng trong component:
 * useEffect(() => {
 *   requireRole(ROLE.GIANG_VIEN, () => setPage("login"));
 * }, []);
 */
export function requireRole(role, onFail) {
  if (!isLoggedIn() || getVaiTro() !== role) {
    onFail && onFail();
    return false;
  }
  return true;
}

export function requireAuth(onFail) {
  if (!isLoggedIn()) {
    onFail && onFail();
    return false;
  }
  return true;
}