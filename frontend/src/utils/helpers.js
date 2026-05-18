// ============================================================
//  utils/helpers.js
//  Các hàm tiện ích dùng chung toàn app
// ============================================================

// ── Format thời gian ─────────────────────────────────────
export function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function formatToday() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long", day: "numeric", month: "numeric", year: "numeric",
  });
}

export function isBaiThiConHan(baiThi) {
  if (!baiThi?.gioKetThuc) return !!baiThi?.conHan;
  const now = new Date();
  const end = new Date(baiThi.gioKetThuc);
  return now < end;
}

// ── Chấm điểm tự động ────────────────────────────────────
export function gradeQuestion(q, ans) {
  if (ans == null || ans === undefined || ans === "") return 0;
  const maxDiem = q.diem || 1;

  switch (q.loaiCauHoi) {
    case 1: {
      // Trắc nghiệm
      // Cẩn thận bắt cả trường hợp DB trả về true, "true", hoặc 1
      const correctOption = q.dapAnTracNghiem?.find(
        (a) => a.laDapAnDung === true || a.laDapAnDung === 1 || String(a.laDapAnDung) === "true"
      );
      const correct = correctOption?.maDapAn;
      
      // ĐÃ SỬA: Ép kiểu String để chống lỗi "1" === 1
      return String(ans) === String(correct) ? maxDiem : 0;
    }
    case 2: {
      // Đúng/Sai
      const correct = q.dapAnDungSai?.dapAnDung;
      // ĐÃ SỬA: Ép kiểu String
      return String(ans) === String(correct) ? maxDiem : 0;
    }
    case 3: {
      // Ghép từ 
      const pairs   = q.dapAnGhepTu || [];
      if (!pairs.length) return 0;
      const correct = pairs.filter(
        (p) => String((ans || {})[p.maGhep]) === String(p.vePhai)
      ).length;
      return +((correct / pairs.length) * maxDiem).toFixed(2);
    }
    case 4: {
      // Điền chỗ trống (Hôm trước tôi đã sửa phần này cho bạn rồi)
      const blanks  = q.dapAnDienChoTrong || [];
      if (!blanks.length) return 0;
      const filled  = ans || [];
      const correct = blanks.filter(
        (b, i) =>
          String(filled[i] || "").trim().toLowerCase() ===
          String(b.tuKhoaDung || "").trim().toLowerCase()
      ).length;
      return +((correct / blanks.length) * maxDiem).toFixed(2);
    }
    default:
      return 0;
  }
}

export function gradeExam(questions, answers) {
  const tongDiem = questions.reduce(
    (sum, q) => sum + gradeQuestion(q, answers[q.maCauHoi]),
    0
  );
  const maxDiem = questions.reduce((sum, q) => sum + (q.diem || 1), 0);
  const diem10  = maxDiem > 0 ? +((tongDiem / maxDiem) * 10).toFixed(2) : 0;
  const tiLe    = maxDiem > 0 ? +((tongDiem / maxDiem) * 100).toFixed(1) : 0;
  return { tongDiem, maxDiem, diem10, tiLe };
}

// ── Màu điểm ─────────────────────────────────────────────
export function diemColor(diem10) {
  if (diem10 >= 8.5) return "#085041"; 
  if (diem10 >= 7.0) return "#534AB7"; 
  if (diem10 >= 5.0) return "#633806"; 
  return "#A32D2D";                    
}

export function diemLabel(diem10) {
  if (diem10 >= 8.5) return "Xuất sắc";
  if (diem10 >= 7.0) return "Khá";
  if (diem10 >= 5.5) return "Trung bình";
  if (diem10 >= 5.0) return "Trung bình";
  return "Không đạt";
}

// ── Loại câu hỏi ─────────────────────────────────────────
export const LOAI_CAU_HOI = {
  1: { label: "Trắc nghiệm",      badge: "tn", color: "#534AB7", bg: "#EEEDFE" },
  2: { label: "Đúng / Sai",       badge: "ds", color: "#0F6E56", bg: "#E1F5EE" },
  3: { label: "Ghép từ",          badge: "gt", color: "#854F0B", bg: "#FAEEDA" },
  4: { label: "Điền chỗ trống",   badge: "dd", color: "#993556", bg: "#FBEAF0" },
};

// ── Validate form ─────────────────────────────────────────
export function validateLoginForm({ tenDangNhap, matKhau }) {
  const errors = {};
  if (!tenDangNhap?.trim()) errors.tenDangNhap = "Vui lòng nhập tên đăng nhập";
  if (!matKhau?.trim())     errors.matKhau     = "Vui lòng nhập mật khẩu";
  if (matKhau && matKhau.length < 6) errors.matKhau = "Mật khẩu tối thiểu 6 ký tự";
  return errors;
}

export function validateBaiThiForm(form) {
  const errors = {};
  if (!form.tenBaiThi?.trim()) errors.tenBaiThi = "Vui lòng nhập tên bài thi";
  if (!form.thoiLuong || form.thoiLuong < 5)
    errors.thoiLuong = "Thời lượng tối thiểu 5 phút";
  return errors;
}

export function validateUserForm(form, isNew) {
  const errors = {};
  if (!form.hoTen?.trim())       errors.hoTen       = "Vui lòng nhập họ tên";
  if (!form.tenDangNhap?.trim()) errors.tenDangNhap = "Vui lòng nhập tên đăng nhập";
  if (isNew && (!form.matKhau || form.matKhau.length < 6))
    errors.matKhau = "Mật khẩu tối thiểu 6 ký tự";
  if (form.email && !/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Email không hợp lệ";
  return errors;
}

// ── Misc ─────────────────────────────────────────────────
export function truncate(str, maxLen = 40) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

export function nameToGradient(name = "") {
  const colors = [
    ["#7F77DD", "#534AB7"],
    ["#1D9E75", "#085041"],
    ["#D85A30", "#993C1D"],
    ["#D4537E", "#993556"],
    ["#BA7517", "#633806"],
  ];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  return `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
}