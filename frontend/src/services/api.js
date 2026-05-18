// ============================================================
//  services/api.js
//  Tất cả các call đến backend Spring Boot (localhost:8080)
//  Không cần cài thêm thư viện — dùng fetch thuần
// ============================================================

const BASE_URL = "http://localhost:8080/api";

// ── Lấy token / user info từ localStorage ────────────────
export const getToken      = ()  => localStorage.getItem("token");
export const getVaiTro     = ()  => Number(localStorage.getItem("vaiTro"));
export const getMaTaiKhoan = ()  => localStorage.getItem("maTaiKhoan");
export const getHoTen      = ()  => localStorage.getItem("hoTen");
export const isLoggedIn    = ()  => !!getToken();

// ── Headers chung ─────────────────────────────────────────
const headers = (extra = {}) => ({
  "Content-Type": "application/json; charset=utf-8",
  Authorization: `Bearer ${getToken()}`,
  "X-User-ID":   getMaTaiKhoan() || "",
  ...extra,
});

// ── Helper fetch có xử lý lỗi ────────────────────────────
async function request(method, path, body = null, extraHeaders = {}) {
  const options = {
    method,
    headers: headers(extraHeaders),
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(err || `HTTP ${res.status}`);
  }

  // Một số endpoint trả về text thay vì JSON
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

const get    = (path, extra)       => request("GET",    path, null, extra);
const post   = (path, body, extra) => request("POST",   path, body, extra);
const put    = (path, body, extra) => request("PUT",    path, body, extra);
const del    = (path, extra)       => request("DELETE", path, null, extra);

// ════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════

/** POST /api/auth/login → { token, vaiTro, hoTen, maTaiKhoan, ... } */
export async function login(tenDangNhap, matKhau) {
  const data = await post("/auth/login", { tenDangNhap, matKhau });
  // Lưu session
  localStorage.setItem("token",       data.token);
  localStorage.setItem("vaiTro",      data.vaiTro);
  localStorage.setItem("hoTen",       data.hoTen);
  localStorage.setItem("maTaiKhoan",  data.maTaiKhoan);
  return data;
}

export async function register(data) {
  return post("/auth/register", data);
}

export async function logout() {
  try {
    await post("/auth/logout");
  } finally {
    localStorage.clear();
  }
}

export function clearSession() {
  localStorage.clear();
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════

/** GET /api/dashboard/student → { classes, examsValid, examsExpired } */
export const getDashboardStudent = () => get("/dashboard/student");

export const getDashboardStudentByClass = (tenLop) =>
  get(`/dashboard/student/exams-by-class-name/${encodeURIComponent(tenLop)}`);

/** GET /api/dashboard/teacher → { examsValid, examsExpired, ... } */
export const getDashboardTeacher = () => get("/dashboard/teacher");

// ════════════════════════════════════════════════════════════
//  BÀI THI  (Teacher CRUD)
// ════════════════════════════════════════════════════════════

/** GET /api/baithi → [] */
export const getAllBaiThi = () => get("/baithi");

/** GET /api/baithi/:id */
export const getBaiThiById = (id) => get(`/baithi/${id}`);

/** GET /api/baithi/class/:maLop */
export const getBaiThiByLop = (maLop) => get(`/baithi/class/${maLop}`);

/** POST /api/baithi */
export const createBaiThi = (data) => post("/baithi", data);

/** PUT /api/baithi/:id */
export const updateBaiThi = (id, data) => put(`/baithi/${id}`, data);

/** DELETE /api/baithi/:id */
export const deleteBaiThi = (id) => del(`/baithi/${id}`);

// ════════════════════════════════════════════════════════════
//  THI ONLINE  (Student)
// ════════════════════════════════════════════════════════════

/** POST /api/exam-taking/start/:maBaiThi/:maSinhVien → { maBaiLam } */
export const startExam = (maBaiThi) =>
  post(`/exam-taking/start/${maBaiThi}`);  // dùng token, backend tự xác định

/** GET /api/exam-taking/questions/:maBaiThi → CauHoi[] */
export const getQuestions = (maBaiThi) =>
  get(`/exam-taking/questions/${maBaiThi}`);

/** POST /api/exam-taking/submit/:maBaiLam?diem=X */
export const submitExam = (maBaiLam, answers) =>
  post(`/exam-taking/submit/${maBaiLam}`, { answers });  // gửi đáp án, backend tự chấm

/** GET /api/exam-taking/check-submitted/:maBaiThi/:maSinhVien */
export const checkSubmitted = (maBaiThi) =>
  get(`/exam-taking/check-submitted/${maBaiThi}/${getMaTaiKhoan()}`);

/** POST /api/exam-taking/copy-paste-detect */
export const reportViolation = () =>
  post("/exam-taking/copy-paste-detect").catch(() => {});

// ════════════════════════════════════════════════════════════
//  ANALYTICS  (Teacher)
// ════════════════════════════════════════════════════════════

/** GET /api/analytics/exam/:maBaiThi */
export const getAnalytics = (maBaiThi) =>
  get(`/analytics/exam/${maBaiThi}`);

/** GET /api/analytics/exam/:maBaiThi/export-csv → download */
export const exportCSV = (maBaiThi) => {
  window.open(`${BASE_URL}/analytics/exam/${maBaiThi}/export-csv`, "_blank");
};

// ════════════════════════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════════════════════════

const adminHeaders = () => ({ "X-Admin-ID": getMaTaiKhoan() });

/** GET /api/admin/users → TaiKhoan[] */
export const getAllUsers = () =>
  get("/admin/users", adminHeaders());

/** POST /api/admin/users */
export const createUser = (data) =>
  post("/admin/users", data, adminHeaders());

/** PUT /api/admin/users/:id */
export const updateUser = (id, data) =>
  put(`/admin/users/${id}`, data, adminHeaders());

/** DELETE /api/admin/users/:id */
export const deleteUser = (id) =>
  del(`/admin/users/${id}`, adminHeaders());

/** GET /api/admin/logs → NhatKy[] */
export const getAllLogs = () =>
  get("/admin/logs", adminHeaders());

/** GET /api/admin/logs/:maTaiKhoan */
export const getUserLogs = (maTaiKhoan) =>
  get(`/admin/logs/${maTaiKhoan}`, adminHeaders());

// ════════════════════════════════════════════════════════════
//  NGÂN HÀNG CÂU HỎI (GIẢNG VIÊN)
// ════════════════════════════════════════════════════════════

/** POST /api/cauhoi */
export const createCauHoi = (data) => post("/cauhoi", data);

/** GET /api/cauhoi (Lấy danh sách) */
export const getAllCauHoi = () => get("/cauhoi");

/** DELETE /api/cauhoi/:id (Xóa câu hỏi) */
export const deleteCauHoi = (id) => del(`/cauhoi/${id}`);

/** GET /api/cauhoi/:id */
export const getCauHoiById = (id) => get(`/cauhoi/${id}`);

/** PUT /api/cauhoi/:id */
export const updateCauHoi = (id, data) => put(`/cauhoi/${id}`, data);


// ════════════════════════════════════════════════════════════
//  ĐỒNG BỘ BÍ DANH (ALIAS EXPORTS) CHO TEACHER PAGE NEW
// ════════════════════════════════════════════════════════════
export {
  getAllBaiThi as getExams,
  createBaiThi as createExam,
  updateBaiThi as updateExam,
  deleteBaiThi as deleteExam
};