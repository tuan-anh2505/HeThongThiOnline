import { useEffect, useRef, useState } from "react";
import { getExams, createExam, updateExam, deleteExam, getAnalytics } from "../services/api";
import QuestionBankPage from "./QuestionBankPage"; 

const THEME_COLORS = {
  primary: "#0F8A6E",
  primary2: "#065C49",
  border: "#B2E0D4",
  bg: "#F0FBF8",
  light: "#E6F7F3",
  accent: "#D4930A",
  danger: "#D32F2F",
  blue: "#185ADB"
};

// ==========================================
// TỪ ĐIỂN MAP: MÔN HỌC CHUẨN
// ==========================================
const MOCK_MON_HOC = [
  { id: 1, name: "Lập trình mạng" },
  { id: 2, name: "Cơ sở dữ liệu" },
  { id: 3, name: "Triết học Mác-Lênin" },
  { id: 4, name: "Tư tưởng Hồ Chí Minh" },
  { id: 5, name: "Lập trình Web" },
  { id: 6, name: "Lập trình C/C++" },
  { id: 7, name: "Java cơ bản" }
];

// ĐÃ CẬP NHẬT CHUẨN 9 LỚP THEO YÊU CẦU
const MOCK_LOP = [
  { id: 1, name: "TTM63" },
  { id: 2, name: "TTM64" },
  { id: 3, name: "TTMN65" },
  { id: 4, name: "KPM63" },
  { id: 5, name: "KPM64" },
  { id: 6, name: "KPM65" },
  { id: 7, name: "CNTT63" },
  { id: 8, name: "CNTT64" },
  { id: 9, name: "CNTT65" }
];

const MOCK_CA_THI_ARRAY = [
  { id: 1, name: "Ca 1 (07:00 - 09:00)" },
  { id: 2, name: "Ca 2 (09:30 - 11:30)" },
  { id: 3, name: "Ca 3 (13:00 - 15:00)" },
  { id: 4, name: "Ca 4 (15:30 - 17:30)" },
  { id: 5, name: "Vô thời hạn (Đề ôn tập)" },
  { id: 6, name: "⏱️ Tùy chỉnh (Tự chọn ngày giờ)..." }
];

const MOCK_NGAN_HANG = [
  { id: 6, name: "Ngân hàng Lập trình mạng" },
  { id: 7, name: "Ngân hàng Cơ sở dữ liệu" },
  { id: 8, name: "Ngân hàng Triết học" },
  { id: 9, name: "Ngân hàng Tư tưởng HCM" },
  { id: 10, name: "Ngân hàng Lập trình Web" },
  { id: 11, name: "Ngân hàng Lập trình C" },
  { id: 12, name: "Ngân hàng Java cơ bản" }
];

// DỮ LIỆU MOCK GIẢ LẬP TIẾN ĐỘ VÀ ĐIỂM SỐ CỦA SINH VIÊN
const INITIAL_STUDENTS_EXAMS = [
  { maSV: "SV001", hoTen: "Lê Văn An", maLop: 1, tenBaiThi: "Kiểm tra Giữa kỳ CSDL", trangThai: "done", diem: 8.5 },
  { maSV: "SV002", hoTen: "Phạm Thị Bình", maLop: 1, tenBaiThi: "Kiểm tra Giữa kỳ CSDL", trangThai: "doing", diem: null },
  { maSV: "SV003", hoTen: "Hoàng Văn Cường", maLop: 2, tenBaiThi: "Thi cuối kỳ Lập trình Web", trangThai: "expired", diem: 0 },
  { maSV: "SV004", hoTen: "Trần Đức Duy", maLop: 4, tenBaiThi: "Kiểm tra Giữa kỳ CSDL", trangThai: "done", diem: 4.5 },
  { maSV: "SV005", hoTen: "Nguyễn Thị Em", maLop: 7, tenBaiThi: "Thi Tư tưởng HCM", trangThai: "doing", diem: null }
];

const getTenMonHoc = (id) => MOCK_MON_HOC.find(m => m.id === id)?.name || `Môn ID: ${id}`;
const getTenLop = (id) => MOCK_LOP.find(m => m.id === id)?.name || `Lớp ID: ${id}`;
const getTenCaThi = (id) => MOCK_CA_THI_ARRAY.find(m => m.id === id)?.name || `Ca ID: ${id}`;

export default function TeacherPage({ onLogout }) {
  const [currentScreen, setCurrentScreen] = useState("exams"); // exams | students | questionBank
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  // Quản lý danh sách tiến độ làm bài sinh viên
  const [studentsExams, setStudentsExams] = useState(INITIAL_STUDENTS_EXAMS);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    tenBaiThi: "", maMonThi: 1, maLop: 1, maCaThi: 1, maNganHang: 6, thoiLuong: 60, gioBatDau: "", gioKetThuc: ""
  });

  useEffect(() => {
    getExams()
      .then((data) => {
        const sorted = (data || []).sort((a, b) => (b.maBaiThi || 0) - (a.maBaiThi || 0));
        setExams(sorted);
      })
      .catch((err) => {
        setError("Không thể tải dữ liệu tự động. Hệ thống đang chạy trên dữ liệu an toàn.");
        setExams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const tempId = Date.now();
    const newExamTemp = { maBaiThi: tempId, ...formData, isTemp: true };
    setExams([newExamTemp, ...exams]);
    setIsAddOpen(false);

    createExam(formData).catch((err) => console.error(err));
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      tenBaiThi: exam.tenBaiThi || "", maMonThi: exam.maMonThi || 1, maLop: exam.maLop || 1, maCaThi: exam.maCaThi || 1, maNganHang: exam.maNganHang || 6, thoiLuong: exam.thoiLuong || 60, gioBatDau: exam.gioBatDau || "", gioKetThuc: exam.gioKetThuc || ""
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingExam) return;
    setExams(exams.map((item) => item.maBaiThi === editingExam.maBaiThi ? { ...item, ...formData } : item));
    setIsEditOpen(false);
    updateExam(editingExam.maBaiThi, formData).catch((err) => console.error(err));
  };

  const handleDelete = (maBaiThi) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài thi này vĩnh viễn?")) return;
    setExams(exams.filter((item) => item.maBaiThi !== maBaiThi));
    deleteExam(maBaiThi).catch((err) => console.error(err));
  };

  // CÁC HÀM XỬ LÝ QUẢN LÝ SINH VIÊN
  const handleCancelExam = (maSV, tenBaiThi) => {
    if (!window.confirm(`Bạn có chắc chắn muốn HỦY BÀI LÀM của sinh viên ${maSV} ở đề thi [${tenBaiThi}] không? Dữ liệu bài làm sẽ biến mất hoàn toàn!`)) return;
    setStudentsExams(studentsExams.filter(s => !(s.maSV === maSV && s.tenBaiThi === tenBaiThi)));
    alert(`✅ Đã hủy bài làm của sinh viên ${maSV} thành công.`);
  };

  const handleRetakeExam = (maSV, tenBaiThi) => {
    if (!window.confirm(`Cho phép sinh viên ${maSV} LÀM LẠI bài thi [${tenBaiThi}]. Điểm cũ sẽ bị reset!`)) return;
    setStudentsExams(studentsExams.map(s => {
      if (s.maSV === maSV && s.tenBaiThi === tenBaiThi) {
        return { ...s, trangThai: "doing", diem: null };
      }
      return s;
    }));
    alert(`🔄 Kích hoạt chế độ thi lại thành công cho sinh viên ${maSV}.`);
  };

  // Lọc dữ liệu sinh viên
  const filteredStudents = studentsExams.filter(s => {
    const matchClass = selectedClassFilter === "all" || s.maLop === parseInt(selectedClassFilter);
    const matchStatus = selectedStatusFilter === "all" || s.trangThai === selectedStatusFilter;
    return matchClass && matchStatus;
  });

  // ĐIỀU HƯỚNG SANG NGÂN HÀNG CÂU HỎI
  if (currentScreen === "questionBank") {
    return <QuestionBankPage onBack={() => setCurrentScreen("exams")} />;
  }

  if (loading) return <div style={S.centerWrapper}>Đang đồng bộ dữ liệu từ hệ thống...</div>;

  return (
    <div style={S.pageWrapper}>
      {error && <div style={S.errorBanner}>{error}</div>}

      {/* THANH ĐIỀU HƯỚNG CHÍNH */}
      <header style={S.headerRow}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <h1 style={S.mainTitle}>Hệ Thống Quản Lý </h1>
          <nav style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
            <button onClick={() => setCurrentScreen("exams")} style={{ ...S.navTab, background: currentScreen === "exams" ? THEME_COLORS.primary : "transparent", color: currentScreen === "exams" ? "white" : THEME_COLORS.primary2 }}>
              📝 Quản lý Bài Thi
            </button>
            <button onClick={() => setCurrentScreen("students")} style={{ ...S.navTab, background: currentScreen === "students" ? THEME_COLORS.primary : "transparent", color: currentScreen === "students" ? "white" : THEME_COLORS.primary2 }}>
              👥 Quản lý Sinh Viên & Điểm
            </button>
          </nav>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ ...S.addBtn, background: THEME_COLORS.danger }} onClick={onLogout}>Đăng xuất</button>
          <button style={{ ...S.addBtn, background: THEME_COLORS.blue }} onClick={() => setCurrentScreen("questionBank")}>📚 Ngân hàng câu hỏi</button>
          {currentScreen === "exams" && (
            <button style={S.addBtn} onClick={() => {
              setFormData({ tenBaiThi: "", maMonThi: 1, maLop: 1, maCaThi: 1, maNganHang: 6, thoiLuong: 60, gioBatDau: "", gioKetThuc: "" });
              setIsAddOpen(true);
            }}>+ Thêm bài thi mới</button>
          )}
        </div>
      </header>

      {/* MÀN HÌNH 1: QUẢN LÝ BÀI THI */}
      {currentScreen === "exams" && (
        <div style={S.tableContainer}>
          <table style={S.table}>
            <thead>
              <tr style={{ background: THEME_COLORS.light }}>
                <th style={S.th}>Mã đề</th>
                <th style={S.th}>Tên bài thi / Đề kiểm tra</th>
                <th style={S.th}>Môn học</th>
                <th style={S.th}>Lớp chỉ định</th>
                <th style={S.th}>Ca thi</th>
                <th style={S.th}>Thời lượng</th>
                <th style={S.th}>Thao tác hệ thống</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr><td colSpan="7" style={{ ...S.td, textAlign: "center", padding: 30, color: "#888" }}>Chưa có bài kiểm tra nào được tạo lập.</td></tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.maBaiThi} style={S.tr}>
                    <td style={S.td}>{exam.isTemp ? "⚡ Tạm" : `#${exam.maBaiThi}`}</td>
                    <td style={{ ...S.td, fontWeight: 700, color: THEME_COLORS.primary2 }}>{exam.tenBaiThi}</td>
                    <td style={S.td}>{getTenMonHoc(exam.maMonThi)}</td>
                    <td style={S.td}><span style={S.badge}>{getTenLop(exam.maLop)}</span></td>
                    <td style={S.td}>{exam.maCaThi === 6 ? "Tùy chọn giờ" : getTenCaThi(exam.maCaThi)}</td>
                    <td style={S.td}>{exam.thoiLuong} phút</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={{ ...S.actionBtn, background: "#EBF3FE", color: "#185ADB" }} onClick={() => openEditModal(exam)}>Sửa</button>
                        <button style={{ ...S.actionBtn, background: "#FEECEB", color: "#D32F2F" }} onClick={() => handleDelete(exam.maBaiThi)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MÀN HÌNH 2: MODULE QUẢN LÝ TIẾN ĐỘ SINH VIÊN & ĐIỂM SỐ */}
      {currentScreen === "students" && (
        <div>
          {/* THANH ĐIỀU KHIỂN BỘ LỌC TÍCH HỢP */}
          <div style={S.filterBar}>
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <div>
                <label style={S.filterLabel}>Chọn Lớp học hành chính:</label>
                <select value={selectedClassFilter} onChange={(e) => setSelectedClassFilter(e.target.value)} style={S.selectFilter}>
                  <option value="all">📚 Tất cả các lớp ({MOCK_LOP.length})</option>
                  {MOCK_LOP.map(l => <option key={l.id} value={l.id}>Lớp {l.name}</option>)}
                </select>
              </div>

              <div>
                <label style={S.filterLabel}>Trạng thái thi làm bài:</label>
                <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} style={S.selectFilter}>
                  <option value="all">🔍 Tất cả trạng thái</option>
                  <option value="doing">🟡 Đang làm bài</option>
                  <option value="done">🟢 Đã nộp bài (Có điểm)</option>
                  <option value="expired">🔴 Quá hạn / Vi phạm</option>
                </select>
              </div>
            </div>
            <div style={{ fontWeight: "bold", color: THEME_COLORS.primary2 }}>
              Tìm thấy: {filteredStudents.length} kết quả dữ liệu
            </div>
          </div>

          {/* BẢNG TIẾN ĐỘ SINH VIÊN */}
          <div style={S.tableContainer}>
            <table style={S.table}>
              <thead>
                <tr style={{ background: THEME_COLORS.light }}>
                  <th style={S.th}>Mã SV</th>
                  <th style={S.th}>Họ và Tên</th>
                  <th style={S.th}>Lớp học</th>
                  <th style={S.th}>Bài kiểm tra thực hiện</th>
                  <th style={S.th}>Trạng thái thời gian thực</th>
                  <th style={S.th}>Điểm số (/10)</th>
                  <th style={{ ...S.th, textAlign: "center" }}>Quyền điều phối bài làm</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="7" style={{ ...S.td, textAlign: "center", padding: 30, color: "#888" }}>Không tìm thấy sinh viên nào khớp với bộ lọc điều kiện.</td></tr>
                ) : (
                  filteredStudents.map((student, idx) => (
                    <tr key={idx} style={S.tr}>
                      <td style={{ ...S.td, fontWeight: "bold" }}>{student.maSV}</td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{student.hoTen}</td>
                      <td style={S.td}><span style={S.badge}>{getTenLop(student.maLop)}</span></td>
                      <td style={S.td}>{student.tenBaiThi}</td>
                      <td style={S.td}>
                        {student.trangThai === "doing" && <span style={{ ...S.statusTag, background: "#FFF7E6", color: "#E28E00" }}>● Đang tiến hành làm bài</span>}
                        {student.trangThai === "done" && <span style={{ ...S.statusTag, background: "#E6F7F3", color: "#0F8A6E" }}>✓ Đã nộp bài thi</span>}
                        {student.trangThai === "expired" && <span style={{ ...S.statusTag, background: "#FEECEB", color: "#D32F2F" }}>🖏 Đã quá hạn giờ</span>}
                      </td>
                      <td style={{ ...S.td, fontWeight: "bold", fontSize: "15px" }}>
                        {student.diem !== null ? `${student.diem} đ` : "—"}
                      </td>
                      <td style={{ ...S.td, textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button onClick={() => handleRetakeExam(student.maSV, student.tenBaiThi)} style={{ ...S.actionBtn, background: "#E8F5E9", color: "#2E7D32" }} title="Reset trạng thái bài thi, cho làm lại bài mới">
                            🔄 Cho làm lại
                          </button>
                          <button onClick={() => handleCancelExam(student.maSV, student.tenBaiThi)} style={{ ...S.actionBtn, background: "#FEECEB", color: "#C62828" }} title="Hủy bỏ kết quả phiên thi hiện tại">
                            🚫 Hủy bài làm
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL: THÊM BÀI THI */}
      {isAddOpen && (
        <div style={S.modalOverlay}>
          <div style={S.modalCard}>
            <h2 style={S.modalTitle}>➕ Khởi tạo đề thi mới</h2>
            <form onSubmit={handleAddSubmit} style={S.form}>
              <div style={S.formGroup}><label style={S.label}>Tên đề kiểm tra:</label><input type="text" required style={S.input} value={formData.tenBaiThi} onChange={(e) => setFormData({ ...formData, tenBaiThi: e.target.value })} placeholder="Ví dụ: Kiểm tra giữa kỳ..." /></div>
              
              <div style={S.formGrid}>
                <div style={S.formGroup}>
                  <label style={S.label}>Môn học:</label>
                  <select style={S.select} value={formData.maMonThi} onChange={(e) => setFormData({ ...formData, maMonThi: parseInt(e.target.value) })}>
                    {MOCK_MON_HOC.map(mon => <option key={mon.id} value={mon.id}>{mon.name}</option>)}
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Lớp hành chính nhận đề:</label>
                  <select style={S.select} value={formData.maLop} onChange={(e) => setFormData({ ...formData, maLop: parseInt(e.target.value) })}>
                    {MOCK_LOP.map(lop => <option key={lop.id} value={lop.id}>{lop.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={S.formGrid}>
                <div style={S.formGroup}>
                  <label style={S.label}>Ca thi phân phối:</label>
                  <select style={S.select} value={formData.maCaThi} onChange={(e) => setFormData({ ...formData, maCaThi: parseInt(e.target.value) })}>
                    {MOCK_CA_THI_ARRAY.map(ca => <option key={ca.id} value={ca.id}>{ca.name}</option>)}
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Ngân hàng câu hỏi trỏ tới:</label>
                  <select style={S.select} value={formData.maNganHang} onChange={(e) => setFormData({ ...formData, maNganHang: parseInt(e.target.value) })}>
                    {MOCK_NGAN_HANG.map(nh => <option key={nh.id} value={nh.id}>{nh.name}</option>)}
                  </select>
                </div>
              </div>

              {formData.maCaThi === 6 && (
                <div style={{ ...S.formGrid, background: "#E8F5E9", padding: "12px", borderRadius: "8px", border: "1px dashed #A5D6A7" }}>
                  <div style={S.formGroup}>
                    <label style={S.label}>Mở mạng lúc:</label>
                    <input type="datetime-local" required style={S.input} value={formData.gioBatDau} onChange={(e) => setFormData({...formData, gioBatDau: e.target.value})} />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Khóa mạng lúc:</label>
                    <input type="datetime-local" required style={S.input} value={formData.gioKetThuc} onChange={(e) => setFormData({...formData, gioKetThuc: e.target.value})} />
                  </div>
                </div>
              )}

              <div style={S.formGroup}><label style={S.label}>Thời gian làm (phút):</label><input type="number" required min="1" style={S.input} value={formData.thoiLuong} onChange={(e) => setFormData({ ...formData, thoiLuong: parseInt(e.target.value) || 60 })} /></div>
              
              <div style={S.modalActions}>
                <button type="button" style={S.cancelBtn} onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" style={S.submitBtn}>Tạo đề thi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL: SỬA BÀI THI */}
      {isEditOpen && (
        <div style={S.modalOverlay}>
          <div style={S.modalCard}>
            <h2 style={S.modalTitle}>📝 Chỉnh sửa cấu hình đề thi</h2>
            <form onSubmit={handleEditSubmit} style={S.form}>
              <div style={S.formGroup}><label style={S.label}>Tên đề kiểm tra:</label><input type="text" required style={S.input} value={formData.tenBaiThi} onChange={(e) => setFormData({ ...formData, tenBaiThi: e.target.value })} /></div>
              
              <div style={S.formGrid}>
                <div style={S.formGroup}>
                  <label style={S.label}>Môn học:</label>
                  <select style={S.select} value={formData.maMonThi} onChange={(e) => setFormData({ ...formData, maMonThi: parseInt(e.target.value) })}>
                    {MOCK_MON_HOC.map(mon => <option key={mon.id} value={mon.id}>{mon.name}</option>)}
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Lớp nhận đề:</label>
                  <select style={S.select} value={formData.maLop} onChange={(e) => setFormData({ ...formData, maLop: parseInt(e.target.value) })}>
                    {MOCK_LOP.map(lop => <option key={lop.id} value={lop.id}>{lop.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={S.formGrid}>
                <div style={S.formGroup}>
                  <label style={S.label}>Ca thi phân phối:</label>
                  <select style={S.select} value={formData.maCaThi} onChange={(e) => setFormData({ ...formData, maCaThi: parseInt(e.target.value) })}>
                    {MOCK_CA_THI_ARRAY.map(ca => <option key={ca.id} value={ca.id}>{ca.name}</option>)}
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Ngân hàng Câu hỏi:</label>
                  <select style={S.select} value={formData.maNganHang} onChange={(e) => setFormData({ ...formData, maNganHang: parseInt(e.target.value) })}>
                    {MOCK_NGAN_HANG.map(nh => <option key={nh.id} value={nh.id}>{nh.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={S.formGroup}><label style={S.label}>Thời gian làm (phút):</label><input type="number" required min="1" style={S.input} value={formData.thoiLuong} onChange={(e) => setFormData({ ...formData, thoiLuong: parseInt(e.target.value) || 60 })} /></div>
              
              <div style={S.modalActions}>
                <button type="button" style={S.cancelBtn} onClick={() => { setIsEditOpen(false); setEditingExam(null); }}>Hủy bỏ</button>
                <button type="submit" style={S.submitBtn}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  pageWrapper: { padding: "24px 32px", background: THEME_COLORS.bg, minHeight: "100vh", fontFamily: "'Segoe UI', Roboto, sans-serif" },
  centerWrapper: { display: "flex", height: "80vh", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: THEME_COLORS.primary2 },
  errorBanner: { padding: "12px 20px", background: "#FEECEB", color: "#D32F2F", borderRadius: 10, marginBottom: 20, fontWeight: 600, border: "1px solid #F5B0AC" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #DDD", paddingBottom: "15px" },
  mainTitle: { fontSize: 22, fontWeight: 800, color: THEME_COLORS.primary2, margin: 0 },
  navTab: { border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", transition: "0.2s" },
  addBtn: { background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primary2})`, color: "white", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 6px rgba(15,138,110,0.15)" },
  tableContainer: { background: "white", borderRadius: 16, border: `1px solid ${THEME_COLORS.border}`, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", marginTop: "15px" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "14px 18px", color: THEME_COLORS.primary2, fontSize: 14, fontWeight: 700, borderBottom: `2px solid ${THEME_COLORS.border}` },
  tr: { borderBottom: "1px solid #EBF6F3", transition: "background 0.2s" },
  td: { padding: "14px 18px", fontSize: 14, color: "#333", verticalAlign: "middle" },
  badge: { background: THEME_COLORS.light, color: THEME_COLORS.primary2, padding: "4px 10px", borderRadius: 6, fontWeight: 600, fontSize: 13 },
  statusTag: { padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-block" },
  actionBtn: { border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  filterBar: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "16px 20px", borderRadius: "12px", border: `1px solid ${THEME_COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" },
  filterLabel: { display: "block", fontSize: "12px", fontWeight: "bold", color: "#555", marginBottom: "5px" },
  selectFilter: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #CCC", background: "white", fontWeight: "600", color: "#333", cursor: "pointer", minWidth: "18px" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(6,92,73,0.3)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)", zIndex: 999 },
  modalCard: { background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
  modalTitle: { margin: "0 0 20px 0", fontSize: 20, fontWeight: 800, color: THEME_COLORS.primary2 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  formGrid: { display: "flex", gap: 14, width: "100%" },
  label: { fontSize: 13, fontWeight: 700, color: "#444" },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC", fontSize: 14, outline: "none", flex: 1 },
  select: { padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC", fontSize: 14, background: "white", cursor: "pointer", flex: 1 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 },
  cancelBtn: { background: "#EEE", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", color: "#555" },
  submitBtn: { background: THEME_COLORS.primary, border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", color: "white" }
};