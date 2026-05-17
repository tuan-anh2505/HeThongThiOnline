// ============================================================
//  utils/mockData.js
//  Dữ liệu mẫu dùng khi backend chưa chạy
//  Các page tự động dùng mock nếu API call thất bại
// ============================================================

// ── Auth ──────────────────────────────────────────────────
export const MOCK_LOGIN_ADMIN = {
  token: "mock.jwt.token",
  maTaiKhoan: "1",
  hoTen: "Nguyễn Văn Admin",
  vaiTro: 0,
};
export const MOCK_LOGIN_GV = {
  token: "mock.jwt.token",
  maTaiKhoan: "2",
  hoTen: "Lã Xuân Anh",
  vaiTro: 1,
};
export const MOCK_LOGIN_SV = {
  token: "mock.jwt.token",
  maTaiKhoan: "3",
  hoTen: "Nguyễn Đăng Thành",
  vaiTro: 2,
};

// ── Dashboard Sinh viên ───────────────────────────────────
export const MOCK_DASHBOARD_STUDENT = {
  classes: ["CNTT64ĐH", "KTPM62ĐH"],
  examsValid: [
    {
      maBaiThi: 1,
      tenBaiThi: "Kiểm tra Giữa Kỳ - Cơ sở dữ liệu",
      tenMonThi: "Cơ sở dữ liệu",
      thoiLuong: 45,
      conHan: true,
      gioBatDau: "07:30",
      gioKetThuc: "09:30",
    },
    {
      maBaiThi: 2,
      tenBaiThi: "Bài thi Lập trình Web",
      tenMonThi: "Lập trình Web",
      thoiLuong: 60,
      conHan: true,
      gioBatDau: "13:00",
      gioKetThuc: "15:00",
    },
  ],
  examsExpired: [
    { maBaiThi: 3, tenBaiThi: "Kiểm tra Cuối Kỳ - CTDL",   tenMonThi: "Cấu trúc dữ liệu", thoiLuong: 90,  conHan: false, diem: 8.5 },
    { maBaiThi: 4, tenBaiThi: "Bài thi Mạng máy tính",     tenMonThi: "Mạng máy tính",    thoiLuong: 60,  conHan: false, diem: 7.0 },
    { maBaiThi: 5, tenBaiThi: "Kiểm tra Hệ điều hành",     tenMonThi: "Hệ điều hành",     thoiLuong: 45,  conHan: false, diem: 9.0 },
  ],
};

// ── Dashboard Giảng viên ──────────────────────────────────
export const MOCK_DASHBOARD_TEACHER = {
  examsValid: [
    { maBaiThi: 1, tenBaiThi: "Kiểm tra Giữa Kỳ - CSDL", tenMonThi: "Cơ sở dữ liệu", thoiLuong: 45, conHan: true,  soThiSinh: 24, diemTB: 7.8 },
    { maBaiThi: 2, tenBaiThi: "Bài thi Lập trình Web",    tenMonThi: "Lập trình Web",   thoiLuong: 60, conHan: true,  soThiSinh: 0,  diemTB: null },
  ],
  examsExpired: [
    { maBaiThi: 3, tenBaiThi: "Kiểm tra Cuối Kỳ - CTDL", tenMonThi: "Cấu trúc dữ liệu", thoiLuong: 90, conHan: false, soThiSinh: 30, diemTB: 6.9 },
    { maBaiThi: 4, tenBaiThi: "Bài thi Mạng máy tính",   tenMonThi: "Mạng máy tính",    thoiLuong: 60, conHan: false, soThiSinh: 28, diemTB: 7.2 },
  ],
};

// ── Câu hỏi ───────────────────────────────────────────────
export const MOCK_QUESTIONS = [
  {
    maCauHoi: 1, loaiCauHoi: 1, diem: 2,
    noiDung: "Trong mô hình quan hệ, khóa chính (Primary Key) có đặc điểm nào sau đây?",
    dapAnTracNghiem: [
      { maDapAn: 1, noiDungDapAn: "Có thể chứa giá trị NULL",             laDapAnDung: false },
      { maDapAn: 2, noiDungDapAn: "Xác định duy nhất mỗi bản ghi",         laDapAnDung: true  },
      { maDapAn: 3, noiDungDapAn: "Một bảng có thể có nhiều khóa chính",  laDapAnDung: false },
      { maDapAn: 4, noiDungDapAn: "Không liên quan đến khóa ngoại",        laDapAnDung: false },
    ],
  },
  {
    maCauHoi: 2, loaiCauHoi: 2, diem: 1,
    noiDung: "SQL là ngôn ngữ lập trình hướng đối tượng dùng để xây dựng giao diện người dùng.",
    dapAnDungSai: { dapAnDung: false },
  },
  {
    maCauHoi: 3, loaiCauHoi: 4, diem: 2,
    noiDung: "Câu lệnh SQL dùng để lấy dữ liệu là _____ và điều kiện lọc là _____.",
    dapAnDienChoTrong: [{ tuKhoaDung: "SELECT" }, { tuKhoaDung: "WHERE" }],
  },
  {
    maCauHoi: 4, loaiCauHoi: 3, diem: 3,
    noiDung: "Nối các khái niệm với định nghĩa phù hợp.",
    dapAnGhepTu: [
      { maGhep: 1, veTrai: "Khóa ngoại",      vePhai: "Tham chiếu đến bảng khác"       },
      { maGhep: 2, veTrai: "Chỉ mục (Index)", vePhai: "Tăng tốc độ truy vấn"            },
      { maGhep: 3, veTrai: "Trigger",         vePhai: "Tự động thực thi khi có sự kiện" },
    ],
  },
  {
    maCauHoi: 5, loaiCauHoi: 1, diem: 2,
    noiDung: "Chuẩn hóa CSDL (3NF) giúp loại bỏ điều gì?",
    dapAnTracNghiem: [
      { maDapAn: 5, noiDungDapAn: "Dư thừa dữ liệu và phụ thuộc bắc cầu", laDapAnDung: true  },
      { maDapAn: 6, noiDungDapAn: "Tất cả các kiểu ràng buộc",             laDapAnDung: false },
      { maDapAn: 7, noiDungDapAn: "Nhu cầu sử dụng khóa ngoại",           laDapAnDung: false },
      { maDapAn: 8, noiDungDapAn: "Mối quan hệ nhiều-nhiều",               laDapAnDung: false },
    ],
  },
];

// ── Analytics ─────────────────────────────────────────────
export const MOCK_ANALYTICS = {
  tenBaiThi: "Kiểm tra Giữa Kỳ - Cơ sở dữ liệu",
  tenMonThi: "Cơ sở dữ liệu",
  soThiSinh: 10,
  diemTrungBinh: 7.4,
  diemCaoNhat: 9.5,
  diemThapNhat: 4.0,
  tiLeQua: 80,
  phanPhoDiem: [
    { khoang: "0–2",  soLuong: 0 },
    { khoang: "2–4",  soLuong: 1 },
    { khoang: "4–5",  soLuong: 1 },
    { khoang: "5–6",  soLuong: 2 },
    { khoang: "6–7",  soLuong: 1 },
    { khoang: "7–8",  soLuong: 2 },
    { khoang: "8–9",  soLuong: 2 },
    { khoang: "9–10", soLuong: 1 },
  ],
  danhSachThiSinh: [
    { maSV: "101743", hoTen: "Nguyễn Đăng Thành",  diem: 8.5, thoiGianNop: "08:12:33", soViPham: 0 },
    { maSV: "101744", hoTen: "Nguyễn Tuấn Anh",    diem: 7.0, thoiGianNop: "08:30:00", soViPham: 2 },
    { maSV: "101745", hoTen: "Trần Thị Mai",        diem: 9.5, thoiGianNop: "07:58:10", soViPham: 0 },
    { maSV: "101746", hoTen: "Lê Văn Hùng",         diem: 6.5, thoiGianNop: "08:25:40", soViPham: 1 },
    { maSV: "101747", hoTen: "Phạm Thị Lan",        diem: 8.0, thoiGianNop: "08:10:22", soViPham: 0 },
    { maSV: "101748", hoTen: "Hoàng Minh Tuấn",     diem: 5.0, thoiGianNop: "08:29:55", soViPham: 3 },
    { maSV: "101749", hoTen: "Đỗ Thị Hương",        diem: 9.0, thoiGianNop: "08:05:30", soViPham: 0 },
    { maSV: "101750", hoTen: "Vũ Đình Nam",          diem: 4.0, thoiGianNop: "08:28:00", soViPham: 5 },
    { maSV: "101751", hoTen: "Bùi Thị Trang",        diem: 7.5, thoiGianNop: "08:18:45", soViPham: 0 },
    { maSV: "101752", hoTen: "Ngô Văn Long",         diem: 6.0, thoiGianNop: "08:22:11", soViPham: 1 },
  ],
};

// ── Admin Users ───────────────────────────────────────────
export const MOCK_USERS = [
  { maTaiKhoan: 1, tenDangNhap: "admin01",    hoTen: "Nguyễn Văn Admin",  email: "admin@vimaru.edu.vn",     soDienThoai: "0901000001", vaiTro: 0, ngayTao: "2025-01-01" },
  { maTaiKhoan: 2, tenDangNhap: "gv.xuananh", hoTen: "Lã Xuân Anh",       email: "laxuananh@vimaru.edu.vn", soDienThoai: "0901000002", vaiTro: 1, ngayTao: "2025-02-10" },
  { maTaiKhoan: 3, tenDangNhap: "sv.thanh",   hoTen: "Nguyễn Đăng Thành", email: "101743@sv.vimaru.edu.vn", soDienThoai: "0901000003", vaiTro: 2, ngayTao: "2025-03-05" },
  { maTaiKhoan: 4, tenDangNhap: "sv.tuananh", hoTen: "Nguyễn Tuấn Anh",   email: "101744@sv.vimaru.edu.vn", soDienThoai: "0901000004", vaiTro: 2, ngayTao: "2025-03-05" },
  { maTaiKhoan: 5, tenDangNhap: "gv.hoa",     hoTen: "Trần Thị Hoa",      email: "tranthihoa@vimaru.edu.vn",soDienThoai: "0901000005", vaiTro: 1, ngayTao: "2025-01-15" },
];

// ── Admin Logs ────────────────────────────────────────────
export const MOCK_LOGS = [
  { maLog: 1, maTaiKhoan: 3, hoTen: "Nguyễn Đăng Thành", hanhDong: "LOGIN",                 thoiGian: "2026-05-16 07:30:12", diaChiIP: "192.168.1.10" },
  { maLog: 2, maTaiKhoan: 3, hoTen: "Nguyễn Đăng Thành", hanhDong: "START_EXAM_1",           thoiGian: "2026-05-16 07:31:00", diaChiIP: "192.168.1.10" },
  { maLog: 3, maTaiKhoan: 3, hoTen: "Nguyễn Đăng Thành", hanhDong: "COPY_PASTE_DETECTED",    thoiGian: "2026-05-16 07:45:22", diaChiIP: "192.168.1.10" },
  { maLog: 4, maTaiKhoan: 3, hoTen: "Nguyễn Đăng Thành", hanhDong: "SUBMIT_EXAM_1",          thoiGian: "2026-05-16 08:15:00", diaChiIP: "192.168.1.10" },
  { maLog: 5, maTaiKhoan: 2, hoTen: "Lã Xuân Anh",        hanhDong: "CREATE_EXAM_2",           thoiGian: "2026-05-15 14:00:00", diaChiIP: "192.168.1.20" },
  { maLog: 6, maTaiKhoan: 2, hoTen: "Lã Xuân Anh",        hanhDong: "VIEW_ANALYTICS_EXAM_1",   thoiGian: "2026-05-15 16:30:00", diaChiIP: "192.168.1.20" },
  { maLog: 7, maTaiKhoan: 4, hoTen: "Nguyễn Tuấn Anh",   hanhDong: "LOGIN",                   thoiGian: "2026-05-16 07:28:00", diaChiIP: "192.168.1.11" },
  { maLog: 8, maTaiKhoan: 4, hoTen: "Nguyễn Tuấn Anh",   hanhDong: "TAB_SWITCH_DETECTED",     thoiGian: "2026-05-16 07:50:00", diaChiIP: "192.168.1.11" },
];

// ── Select options dùng trong form ───────────────────────
export const OPTIONS_LOP      = ["CNTT64ĐH", "KTPM62ĐH", "CNTT65ĐH"];
export const OPTIONS_MON_THI  = ["Cơ sở dữ liệu", "Lập trình Web", "Cấu trúc dữ liệu", "Mạng máy tính"];
export const OPTIONS_CA_THI   = ["Ca 1 (07:30–09:30)", "Ca 2 (09:45–11:45)", "Ca 3 (13:00–15:00)", "Ca 4 (15:15–17:15)"];
export const OPTIONS_NGAN_HANG= ["Ngân hàng CSDL 2025", "Ngân hàng LTWeb", "Ngân hàng CTDL"];