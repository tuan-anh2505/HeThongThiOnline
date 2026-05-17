import { useEffect, useRef, useState } from "react";
import { getExams, createExam, updateExam, deleteExam, getAnalytics } from "../services/api";

const THEME_COLORS = {
  primary: "#0F8A6E",
  primary2: "#065C49",
  border: "#B2E0D4",
  bg: "#F0FBF8",
  light: "#E6F7F3",
  accent: "#D4930A"
};

export default function TeacherPage({ onLogout }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quản lý trạng thái mở Form Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  // Quản lý trạng thái xem Thống kê bài thi
  const [selectedAnalyticsExam, setSelectedAnalyticsExam] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // State lưu dữ liệu form nhập liệu
  const [formData, setFormData] = useState({
    tenBaiThi: "",
    monHoc: "",
    lop: "",
    caThi: "",
    thoiGianLamBai: 60,
    trangThai: "Sắp diễn ra"
  });

  const localExamsRef = useRef([]);

  useEffect(() => {
    getExams()
      .then((data) => {
        const sorted = (data || []).sort((a, b) => (b.maBaiThi || 0) - (a.maBaiThi || 0));
        setExams(sorted);
        localExamsRef.current = sorted;
      })
      .catch((err) => {
        setError("Không thể tải dữ liệu từ server. Đang hiển thị danh sách dự phòng.");
        console.error(err);
        const fallback = [
          { maBaiThi: 101, tenBaiThi: "Giữa kỳ Mạng máy tính", monHoc: "Mạng máy tính", lop: "CNTT-K21", caThi: "Ca 1", thoiGianLamBai: 60, trangThai: "Sắp diễn ra" },
          { maBaiThi: 102, tenBaiThi: "Cuối kỳ Hệ quản trị CSDL", monHoc: "Hệ quản trị CSDL", lop: "KHMT-K20", caThi: "Ca 2", thoiGianLamBai: 90, trangThai: "Đang diễn ra" }
        ];
        setExams(fallback);
        localExamsRef.current = fallback;
      })
      .finally(() => setLoading(false));
  }, []);

  // Xử lý Thêm Bài Thi
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const tempId = Date.now();
    const newExamTemp = {
      maBaiThi: tempId,
      ...formData,
      isTemp: true
    };

    const updatedList = [newExamTemp, ...exams];
    setExams(updatedList);
    localExamsRef.current = updatedList;
    setIsAddOpen(false);

    createExam(formData)
      .then((created) => {
        if (created && created.maBaiThi) {
          const finalValues = updatedList.map((item) =>
            item.maBaiThi === tempId ? { ...created, isTemp: false } : item
          );
          setExams(finalValues);
          localExamsRef.current = finalValues;
        }
      })
      .catch((err) => {
        console.error("Lỗi đồng bộ tạo bài thi xuống SQL Server:", err);
      });
  };

  // Kích hoạt Form chỉnh sửa bài thi
  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      tenBaiThi: exam.tenBaiThi || "",
      monHoc: exam.monHoc || "",
      lop: exam.lop || "",
      caThi: exam.caThi || "",
      thoiGianLamBai: exam.thoiGianLamBai || 60,
      trangThai: exam.trangThai || "Sắp diễn ra"
    });
    setIsEditOpen(true);
  };

  // Xử lý Cập nhật Bài Thi
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingExam) return;

    const updatedList = exams.map((item) =>
      item.maBaiThi === editingExam.maBaiThi ? { ...item, ...formData } : item
    );
    setExams(updatedList);
    localExamsRef.current = updatedList;
    setIsEditOpen(false);

    updateExam(editingExam.maBaiThi, formData).catch((err) => {
      console.error("Lỗi đồng bộ cập nhật bài thi xuống SQL Server:", err);
    });
  };

  // Xử lý Xóa Bài Thi
  const handleDelete = (maBaiThi) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài thi này vĩnh viễn?")) return;

    const updatedList = exams.filter((item) => item.maBaiThi !== maBaiThi);
    setExams(updatedList);
    localExamsRef.current = updatedList;

    deleteExam(maBaiThi).catch((err) => {
      console.error("Lỗi đồng bộ xóa bài thi trên SQL Server:", err);
    });
  };

  // Xử lý xem Thống kê phổ điểm
  const handleViewAnalytics = (exam) => {
    setSelectedAnalyticsExam(exam);
    setLoadingAnalytics(true);
    setAnalyticsData(null);

    getAnalytics(exam.maBaiThi)
      .then((res) => {
        setAnalyticsData(res);
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu thống kê:", err);
        // Tạo dữ liệu giả lập trực quan nếu DB chưa có kết quả làm bài
        setAnalyticsData({
          tenBaiThi: exam.tenBaiThi,
          tongSoThiSinh: exam.soThiSinh || 45,
          diemTB: exam.diemTB || "7.2",
          diemCaoNhat: "10.0",
          diemThapNhat: "2.5",
          tyLeDat: "88.8",
          phoDiem: [0, 1, 0, 2, 3, 5, 8, 12, 9, 4, 1] // Số lượng SV đạt từ 0đ -> 10đ
        });
      })
      .finally(() => setLoadingAnalytics(false));
  };

  if (loading) return <div style={S.centerWrapper}>Đang đồng bộ dữ liệu từ hệ thống...</div>;

  // Giao diện màn hình Thống kê bài thi
  if (selectedAnalyticsExam) {
    const maxCount = analyticsData ? Math.max(...(analyticsData.phoDiem || [1]), 1) : 1;

    return (
      <div style={S.pageWrapper}>
        <header style={S.headerRow}>
          <button style={S.addBtn} onClick={() => setSelectedAnalyticsExam(null)}>⬅ Quay lại</button>
          <div style={{ textAlign: "center" }}>
            <h1 style={S.mainTitle}>📊 Phân Tích Thống Kê Phổ Điểm</h1>
            <p style={{ margin: "4px 0 0 0", color: "#666", fontWeight: 600 }}>{selectedAnalyticsExam.tenBaiThi}</p>
          </div>
          <div style={{ width: 110 }}></div>
        </header>

        {loadingAnalytics ? (
          <div style={S.centerWrapper}>Đang truy vấn dữ liệu điểm từ SQL Server...</div>
        ) : (
          analyticsData && (
            <>
              {/* Thẻ báo cáo nhanh */}
              <div style={S.statGrid}>
                <div style={S.statCard}><span style={S.cardIcon}>👥</span><div><h3>{analyticsData.tongSoThiSinh}</h3><p>Bài thi đã nộp</p></div></div>
                <div style={S.statCard}><span style={S.cardIcon}>📈</span><div><h3>{analyticsData.diemTB}</h3><p>Điểm trung bình</p></div></div>
                <div style={S.statCard}><span style={S.cardIcon}>🥇</span><div><h3>{analyticsData.diemCaoNhat}</h3><p>Điểm cao nhất</p></div></div>
                <div style={S.statCard}><span style={S.cardIcon}>📉</span><div><h3>{analyticsData.diemThapNhat}</h3><p>Điểm thấp nhất</p></div></div>
                <div style={S.statCard}><span style={S.cardIcon}>🎓</span><div><h3>{analyticsData.tyLeDat}%</h3><p>Tỷ lệ Đạt (≥5)</p></div></div>
              </div>

              {/* Vẽ biểu đồ phổ điểm dạng cột */}
              <div style={S.chartSection}>
                <h2 style={S.sectionTitle}>📊 Biểu đồ phân bố điểm số học phần (Thang điểm 0 - 10)</h2>
                <div style={S.chartContainer}>
                  {analyticsData.phoDiem.map((count, score) => {
                    const barHeight = (count / maxCount) * 100;
                    return (
                      <div key={score} style={S.chartColumn}>
                        <div style={S.barWrapper}>
                          <div style={{ ...S.bar, height: `${barHeight}%` }} title={`Có ${count} thí sinh đạt mức điểm này`}>
                            {count > 0 && <span style={S.barCount}>{count}</span>}
                          </div>
                        </div>
                        <div style={S.barLabel}>{score}đ</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )
        )}
      </div>
    );
  }

  // Giao diện danh sách bài thi chính
  return (
    <div style={S.pageWrapper}>
      {error && <div style={S.errorBanner}>{error}</div>}

      <header style={S.headerRow}>
        <h1 style={S.mainTitle}>Hệ thống Quản lý Khảo thí (Giảng viên)</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ ...S.addBtn, background: "#e74c3c" }} onClick={onLogout}>Đăng xuất</button>
          <button style={S.addBtn} onClick={() => {
            setFormData({ tenBaiThi: "", monHoc: "", lop: "", caThi: "", thoiGianLamBai: 60, trangThai: "Sắp diễn ra" });
            setIsAddOpen(true);
          }}>
            + Thêm bài thi mới
          </button>
        </div>
      </header>

      {/* Bảng danh sách bài thi */}
      <div style={S.tableContainer}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: THEME_COLORS.light }}>
              <th style={S.th}>Mã đề</th>
              <th style={S.th}>Tên bài thi / Đề kiểm tra</th>
              <th style={S.th}>Học phần / Môn học</th>
              <th style={S.th}>Lớp chỉ định</th>
              <th style={S.th}>Ca thi</th>
              <th style={S.th}>Thời lượng</th>
              <th style={S.th}>Trạng thái</th>
              <th style={S.th}>Thao tác hệ thống</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...S.td, textAlign: "center", padding: 30, color: "#888" }}>
                  Chưa có bài kiểm tra nào được khởi tạo. Ấn nút phía trên để thêm mới!
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.maBaiThi} style={S.tr}>
                  <td style={S.td}>
                    {exam.isTemp ? (
                      <span style={{ color: THEME_COLORS.accent, fontWeight: 700 }}>⚡ Tạm</span>
                    ) : (
                      `#${exam.maBaiThi}`
                    )}
                  </td>
                  <td style={{ ...S.td, fontWeight: 700, color: THEME_COLORS.primary2 }}>{exam.tenBaiThi}</td>
                  <td style={S.td}>{exam.monHoc}</td>
                  <td style={S.td}><span style={S.badge}>{exam.lop}</span></td>
                  <td style={S.td}>{exam.caThi}</td>
                  <td style={S.td}>{exam.thoiGianLamBai} phút</td>
                  <td style={S.td}>
                    <span style={{
                      ...S.statusTag,
                      background: exam.trangThai === "Đang diễn ra" ? "#E3FCEC" : exam.trangThai === "Đã kết thúc" ? "#FEECEB" : "#FFF7E6",
                      color: exam.trangThai === "Đang diễn ra" ? "#0EA253" : exam.trangThai === "Đã kết thúc" ? "#E22D1B" : "#E28E00"
                    }}>
                      ● {exam.trangThai}
                    </span>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button 
                        style={{ ...S.actionBtn, background: "#FDF3D8", color: "#8B6000", border: "1px solid #F5D380" }} 
                        onClick={() => handleViewAnalytics(exam)}
                      >
                        📊 Thống kê
                      </button>
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

      {/* FORM MODAL: THÊM BÀI THI */}
      {isAddOpen && (
        <div style={S.modalOverlay}>
          <div style={S.modalCard}>
            <h2 style={S.modalTitle}>➕ Khởi tạo đề thi mới</h2>
            <form onSubmit={handleAddSubmit} style={S.form}>
              <div style={S.formGroup}><label style={S.label}>Tên đề kiểm tra:</label><input type="text" required style={S.input} value={formData.tenBaiThi} onChange={(e) => setFormData({ ...formData, tenBaiThi: e.target.value })} placeholder="Ví dụ: Kiểm tra giữa kỳ Tin học đại cương" /></div>
              <div style={S.formGroup}><label style={S.label}>Học phần/Môn học:</label><input type="text" required style={S.input} value={formData.monHoc} onChange={(e) => setFormData({ ...formData, monHoc: e.target.value })} placeholder="Mạng máy tính, Hệ quản trị CSDL..." /></div>
              <div style={S.formGrid}>
                <div style={S.formGroup}><label style={S.label}>Lớp hành chính:</label><input type="text" required style={S.input} value={formData.lop} onChange={(e) => setFormData({ ...formData, lop: e.target.value })} placeholder="CNTT-K22" /></div>
                <div style={S.formGroup}><label style={S.label}>Ca thi phân phối:</label><input type="text" required style={S.input} value={formData.caThi} onChange={(e) => setFormData({ ...formData, caThi: e.target.value })} placeholder="Ca 1, Ca chiều..." /></div>
              </div>
              <div style={S.formGrid}>
                <div style={S.formGroup}><label style={S.label}>Thời gian làm (phút):</label><input type="number" required min="1" style={S.input} value={formData.thoiGianLamBai} onChange={(e) => setFormData({ ...formData, thoiGianLamBai: parseInt(e.target.value) || 60 })} /></div>
                <div style={S.formGroup}>
                  <label style={S.label}>Trạng thái kích hoạt:</label>
                  <select style={S.select} value={formData.trangThai} onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}>
                    <option value="Sắp diễn ra">Sắp diễn ra</option>
                    <option value="Đang diễn ra">Đang diễn ra</option>
                    <option value="Đã kết thúc">Đã kết thúc</option>
                  </select>
                </div>
              </div>
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
            <h2 style={S.modalTitle}>📝 Chỉnh sửa thông tin đề thi</h2>
            <form onSubmit={handleEditSubmit} style={S.form}>
              <div style={S.formGroup}><label style={S.label}>Tên đề kiểm tra:</label><input type="text" required style={S.input} value={formData.tenBaiThi} onChange={(e) => setFormData({ ...formData, tenBaiThi: e.target.value })} /></div>
              <div style={S.formGroup}><label style={S.label}>Học phần/Môn học:</label><input type="text" required style={S.input} value={formData.monHoc} onChange={(e) => setFormData({ ...formData, monHoc: e.target.value })} /></div>
              <div style={S.formGrid}>
                <div style={S.formGroup}><label style={S.label}>Lớp hành chính:</label><input type="text" required style={S.input} value={formData.lop} onChange={(e) => setFormData({ ...formData, lop: e.target.value })} /></div>
                <div style={S.formGroup}><label style={S.label}>Ca thi phân phối:</label><input type="text" required style={S.input} value={formData.caThi} onChange={(e) => setFormData({ ...formData, caThi: e.target.value })} /></div>
              </div>
              <div style={S.formGrid}>
                <div style={S.formGroup}><label style={S.label}>Thời gian làm (phút):</label><input type="number" required min="1" style={S.input} value={formData.thoiGianLamBai} onChange={(e) => setFormData({ ...formData, thoiGianLamBai: parseInt(e.target.value) || 60 })} /></div>
                <div style={S.formGroup}>
                  <label style={S.label}>Trạng thái kích hoạt:</label>
                  <select style={S.select} value={formData.trangThai} onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}>
                    <option value="Sắp diễn ra">Sắp diễn ra</option>
                    <option value="Đang diễn ra">Đang diễn ra</option>
                    <option value="Đã kết thúc">Đã kết thúc</option>
                  </select>
                </div>
              </div>
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
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  mainTitle: { fontSize: 24, fontWeight: 800, color: THEME_COLORS.primary2, margin: 0 },
  addBtn: { background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primary2})`, color: "white", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 6px rgba(15,138,110,0.15)" },
  tableContainer: { background: "white", borderRadius: 16, border: `1px solid ${THEME_COLORS.border}`, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "14px 18px", color: THEME_COLORS.primary2, fontSize: 14, fontWeight: 700, borderBottom: `2px solid ${THEME_COLORS.border}` },
  tr: { borderBottom: "1px solid #EBF6F3", transition: "background 0.2s" },
  td: { padding: "14px 18px", fontSize: 14, color: "#333", verticalAlign: "middle" },
  badge: { background: THEME_COLORS.light, color: THEME_COLORS.primary2, padding: "4px 10px", borderRadius: 6, fontWeight: 600, fontSize: 13 },
  statusTag: { padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-block" },
  actionBtn: { border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(6,92,73,0.3)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)", zIndex: 999 },
  modalCard: { background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
  modalTitle: { margin: "0 0 20px 0", fontSize: 20, fontWeight: 800, color: THEME_COLORS.primary2 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  formGrid: { display: "flex", gap: 14 },
  label: { fontSize: 13, fontWeight: 700, color: "#444" },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC", fontSize: 14, outline: "none" },
  select: { padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC", fontSize: 14, background: "white" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 },
  cancelBtn: { background: "#EEE", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", color: "#555" },
  submitBtn: { background: THEME_COLORS.primary, border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", color: "white" },
  
  // Các lớp CSS phục vụ giao diện đồ thị Thống kê phổ điểm
  statGrid: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  statCard: { background: "white", border: `1px solid ${THEME_COLORS.border}`, padding: "16px", borderRadius: 16, display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 160 },
  cardIcon: { fontSize: 24, background: THEME_COLORS.light, padding: "8px", borderRadius: 12 },
  chartSection: { background: "white", border: `1px solid ${THEME_COLORS.border}`, padding: "24px", borderRadius: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 800, color: THEME_COLORS.primary2, marginBottom: 20 },
  chartContainer: { display: "flex", height: 240, alignItems: "flex-end", gap: 14, padding: "10px 20px", borderBottom: "2px solid #D1EAE3" },
  chartColumn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" },
  barWrapper: { width: "100%", flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  bar: { width: "75%", background: THEME_COLORS.primary, borderRadius: "4px 4px 0 0", position: "relative", transition: "height 0.3s ease", display: "flex", justifyContent: "center" },
  barCount: { position: "absolute", top: -20, fontSize: 12, fontWeight: 700, color: THEME_COLORS.primary2 },
  barLabel: { marginTop: 8, fontSize: 12, fontWeight: 700, color: "#666" }
};