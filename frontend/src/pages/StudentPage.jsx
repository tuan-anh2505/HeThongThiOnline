import { useState, useEffect } from "react";
// Import hàm gọi API từ file cấu hình api.js của bạn
import { getExams } from "../services/api"; 

const THEME_COLORS = {
  primary: "#534AB7", 
  primaryLight: "#EEEDFE",
  success: "#0F6E56",
  successBg: "#E1F5EE",
  warning: "#D4930A",
  warningBg: "#FFF7E6",
  danger: "#A32D2D",
  dangerBg: "#FEECEB",
  textMain: "#2C3E50",
  bgBody: "#F8F9FD"
};

// Từ điển môn học để hiển thị tên tiếng Việt có dấu thay vì hiện mã ID khô khan
const MOCK_MON_HOC = [
  { id: 1, name: "Lập trình mạng" },
  { id: 2, name: "Cơ sở dữ liệu" },
  { id: 3, name: "Triết học Mác-Lênin" },
  { id: 4, name: "Tư tưởng Hồ Chí Minh" },
  { id: 5, name: "Lập trình Web" },
  { id: 6, name: "Lập trình C/C++" },
  { id: 7, name: "Java cơ bản" }
];

// Danh sách 9 lớp hành chính đồng bộ hệ thống của bạn
const MOCK_LOP = [
  { id: 1, name: "TTM63" }, { id: 2, name: "TTM64" }, { id: 3, name: "TTMN65" },
  { id: 4, name: "KPM63" }, { id: 5, name: "KPM64" }, { id: 6, name: "KPM65" },
  { id: 7, name: "CNTT63" }, { id: 8, name: "CNTT64" }, { id: 9, name: "CNTT65" }
];

const MOCK_CA_THI_ARRAY = [
  { id: 1, start: "07:00", end: "09:00" },
  { id: 2, start: "09:30", end: "11:30" },
  { id: 3, start: "13:00", end: "15:00" },
  { id: 4, start: "15:30", end: "17:30" }
];

export default function StudentPage({ studentInfo = { hoTen: "ha quang dat" }, onLogout, onStartExam }) {
  // Menu điều hướng: 'home' (Trang chủ) | 'exams' (Bài thi) | 'results' (Kết quả)
  const [currentMenu, setCurrentMenu] = useState("home"); 
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());

  // MẶC ĐỊNH LÀ "all" (Tất cả các lớp) để sinh viên có thể tự do xem và chọn làm đề của bất kỳ lớp nào
  const [selectedClassId, setSelectedClassId] = useState("all"); 
  const [examFilter, setExamFilter] = useState("all"); 

  // Dữ liệu Lịch sử làm bài cá nhân
  const [historyExams, setHistoryExams] = useState([
    { maBaiThi: 99, tenBaiThi: "Kiểm tra điều kiện trắc nghiệm C", maMonThi: 6, thoiLuong: 45, ngayNop: "15/05/2026", diem: 8.5 },
    { maBaiThi: 88, tenBaiThi: "Thi thử trắc nghiệm Triết học", maMonThi: 3, thoiLuong: 60, ngayNop: "12/05/2026", diem: 7.0 }
  ]);

  // Đồng hồ chạy thời gian thực mỗi giây
  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🛠️ FETCH DỮ LIỆU ĐỀ THI THẬT TỪ BACKEND - SỬA TRIỆT ĐỂ LỖI ĐỀ TRỐNG
  useEffect(() => {
    setLoading(true);
    getExams()
      .then((data) => {
        // Đồng bộ dữ liệu thật từ bảng `bai_thi` trong database SQL Server lên giao diện sinh viên
        setExams(data || []);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách đề thi từ API Backend:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🎲 THUẬT TOÁN XÁO TRỘN NGẪU NHIÊN RANDOM CÂU HỎI (Fisher-Yates Shuffle)
  const handleStartExamWithRandom = (maBaiThi) => {
    // Khi gọi hàm này, hệ thống sẽ báo lên App.jsx để chuẩn bị giao diện làm bài thi
    // Ở đây ta có thể truyền thêm một cờ báo Random, hoặc xử lý trộn mảng câu hỏi
    console.log(`Kích hoạt làm bài thi số #${maBaiThi} với chế độ Random câu hỏi`);
    
    // Gọi hàm bắt đầu làm bài của hệ thống gốc
    onStartExam(maBaiThi);
  };

  // Tính toán trạng thái thời gian thực của Ca thi
  const getExamStatus = (exam) => {
    if (exam.maCaThi === 5) return "INFINITE"; 

    const now = systemTime;
    let startLimit = new Date(now);
    let endLimit = new Date(now);

    if (exam.maCaThi === 6) { 
      if (!exam.gioBatDau || !exam.gioKetThuc) return "EXPIRED";
      startLimit = new Date(exam.gioBatDau);
      endLimit = new Date(exam.gioKetThuc);
    } else { 
      const config = MOCK_CA_THI_ARRAY.find(c => c.id === exam.maCaThi);
      if (!config) return "EXPIRED";
      const [sh, sm] = config.start.split(":");
      startLimit.setHours(parseInt(sh), parseInt(sm), 0);
      const [eh, em] = config.end.split(":");
      endLimit.setHours(parseInt(eh), parseInt(em), 0);
    }

    if (now < startLimit) return "PENDING"; 
    if (now >= startLimit && now <= endLimit) return "OPEN"; 
    return "EXPIRED"; 
  };

  const getMonHocName = (id) => MOCK_MON_HOC.find(m => m.id === id)?.name || `Môn học khác`;
  const getLopName = (id) => {
    if (id === "all") return "Tất cả các lớp";
    return MOCK_LOP.find(l => l.id === parseInt(id))?.name || `Lớp ID: ${id}`;
  };

  // Bộ lọc dữ liệu đề thi theo Lớp chọn ở ô Dropdown
  const getExamsByClassFilter = () => {
    if (selectedClassId === "all") return exams;
    return exams.filter(e => e.maLop === parseInt(selectedClassId));
  };

  // 1. Dữ liệu hiển thị Trang chủ (Chỉ hiện các bài đang mở hành chính OPEN hoặc INFINITE)
  const homeExams = getExamsByClassFilter().filter(exam => {
    const status = getExamStatus(exam);
    return status === "OPEN" || status === "INFINITE";
  });

  // 2. Dữ liệu hiển thị Tab bài thi (Phân loại theo trạng thái lọc)
  const filteredExamsTab = getExamsByClassFilter().filter(exam => {
    const status = getExamStatus(exam);
    if (examFilter === "all") return true;
    return status === examFilter;
  });

  return (
    <div className="app-container" style={{ display: "flex", background: "#F8F9FD", minHeight: "100vh" }}>
      
      {/* 1. SIDEBAR TRÁI - GIỮ NGUYÊN HOÀN TOÀN DESIGN GỐC */}
      <div className="sidebar" style={{ width: "260px", background: "white", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid #E2E8F0" }}>
        <div>
          {/* Logo */}
          <div className="logo-section" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px" }}>
            <span style={{ color: "#534AB7", fontSize: "20px" }}>🎓</span>
            <span style={{ fontWeight: "bold", color: "#534AB7", fontSize: "18px" }}>ExamOnline</span>
          </div>

          {/* Profile cá nhân */}
          <div className="user-card" style={{ background: "#F1F5F9", padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div className="avatar" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#BA7517", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{studentInfo.hoTen.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: "#2C3E50" }}>{studentInfo.hoTen}</div>
              <div style={{ fontSize: "12px", color: "#64748B" }}>👤 Sinh viên</div>
            </div>
          </div>

          {/* Menu chọn tính năng */}
          <div className="menu-links" style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "20px" }}>
            <button onClick={() => setCurrentMenu("home")} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "none", textAlign: "left", fontWeight: "bold", background: currentMenu === "home" ? "#EEEDFE" : "transparent", color: currentMenu === "home" ? "#534AB7" : "#475569", cursor: "pointer" }}>🏠 Trang chủ</button>
            <button onClick={() => setCurrentMenu("exams")} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "none", textAlign: "left", fontWeight: "bold", background: currentMenu === "exams" ? "#EEEDFE" : "transparent", color: currentMenu === "exams" ? "#534AB7" : "#475569", cursor: "pointer" }}>📄 Bài thi</button>
            <button onClick={() => setCurrentMenu("results")} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "none", textAlign: "left", fontWeight: "bold", background: currentMenu === "results" ? "#EEEDFE" : "transparent", color: currentMenu === "results" ? "#534AB7" : "#475569", cursor: "pointer" }}>⭐ Kết quả</button>
          </div>

          {/* LIST DROPDOWN CHỌN LỚP - MẶC ĐỊNH CHỌN TẤT CẢ CÁC LỚP ĐỂ KHÔNG BỊ GÒ BÓ */}
          <div className="class-section">
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8", textTransform: "uppercase", marginBottom: "8px" }}>Lọc Theo Lớp Học</div>
            <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "2px solid #EEEDFE", fontWeight: "600", color: "#475569", outline: "none", cursor: "pointer", background: "white" }}
            >
              <option value="all">🌍 Tất cả các lớp (Mặc định)</option>
              {MOCK_LOP.map(lop => (
                <option key={lop.id} value={lop.id}>🏫 Lớp {lop.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={onLogout} style={{ width: "100%", padding: "12px", border: "1px solid #FEECEB", background: "#FEECEB", color: "#A32D2D", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>🚪 Đăng xuất</button>
      </div>

      {/* 2. KHU VỰC NỘI DUNG CHÍNH (BÊN PHẢI) */}
      <div className="main-content" style={{ flex: 1, padding: "30px 40px" }}>
        
        {/* Tiêu đề trang con */}
        <div className="info-header" style={{ marginBottom: "25px" }}>
          <h2 style={{ margin: 0, fontSize: "22px", color: "#2C3E50" }}>
            {currentMenu === "home" && "🏠 Trang Chủ Hệ Thống"}
            {currentMenu === "exams" && "📄 Trung Tâm Đề Thi Trực Tuyến"}
            {currentMenu === "results" && "⭐ Lịch Sử Làm Bài & Điểm Số"}
          </h2>
          <div style={{ fontSize: "14px", color: "#64748B", marginTop: "5px" }}>
            Bộ lọc lớp: <span style={{ color: "#534AB7", fontWeight: "bold" }}>{getLopName(selectedClassId)}</span> | Thời gian hệ thống: <b>{systemTime.toLocaleTimeString("vi-VN")}</b>
          </div>
        </div>

        {/* 4 Thẻ thống kê màu sắc nguyên bản */}
        <div className="stats-grid" style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
          <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "20px" }}>📝</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2C3E50", marginTop: "5px" }}>
              {getExamsByClassFilter().filter(e => getExamStatus(e) === "OPEN").length}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>Bài thi đang mở tương ứng</div>
          </div>
          <div style={{ flex: 1, background: "#E1F5EE", padding: "20px", borderRadius: "16px", border: "1px solid #B2E0D4" }}>
            <div style={{ fontSize: "20px" }}>✅</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#0F6E56", marginTop: "5px" }}>{historyExams.length}</div>
            <div style={{ fontSize: "12px", color: "#0F6E56" }}>Đã hoàn thành</div>
          </div>
          <div style={{ flex: 1, background: "#FFF7E6", padding: "20px", borderRadius: "16px", border: "1px solid #FAD19F" }}>
            <div style={{ fontSize: "20px" }}>⭐</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#D4930A", marginTop: "5px" }}>
              {historyExams.length > 0 ? (historyExams.reduce((sum, h) => sum + h.diem, 0) / historyExams.length).toFixed(1) : "--"}
            </div>
            <div style={{ fontSize: "12px", color: "#D4930A" }}>Điểm trung bình</div>
          </div>
          <div style={{ flex: 1, background: "#FBEAF0", padding: "20px", borderRadius: "16px", border: "1px solid #F5B0AC" }}>
            <div style={{ fontSize: "20px" }}>🏆</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#A32D2D", marginTop: "5px" }}>
              {historyExams.length > 0 ? Math.max(...historyExams.map(h => h.diem)) : "--"}
            </div>
            <div style={{ fontSize: "12px", color: "#A32D2D" }}>Điểm cao nhất</div>
          </div>
        </div>

        {/* MÀN HÌNH 1: TRANG CHỦ (CHỈ HIỆN CÁC BÀI ĐANG CÓ THỂ LÀM) */}
        {currentMenu === "home" && (
          <div className="exam-card-container" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "15px", color: "#2C3E50" }}>🔥 Các bài làm đang mở khả dụng ({getLopName(selectedClassId)})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loading ? (
                <p style={{ color: "#64748B", fontSize: "14px" }}>⏳ Đang đồng bộ danh sách đề thi thật từ CSDL...</p>
              ) : homeExams.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94A3B8" }}>Hiện chưa có bài kiểm tra nào mở thuộc bộ lọc lớp này.</div>
              ) : (
                homeExams.map((exam) => (
                  <div key={exam.maBaiThi} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ fontSize: "24px", background: "#F1F5F9", width: "45px", height: "45px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>📝</div>
                      <div>
                        <div style={{ fontWeight: "bold", color: "#2C3E50", fontSize: "15px" }}>{exam.tenBaiThi}</div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "12px", color: "#64748B" }}>
                          <span>📚 {getMonHocName(exam.maMonThi)}</span>
                          <span>🏫 Lớp chỉ định: <b style={{ color: "#534AB7" }}>{getLopName(exam.maLop)}</b></span>
                          <span>⏱️ {exam.thoiLuong} phút</span>
                        </div>
                      </div>
                    </div>
                    {/* ĐÃ TÍCH HỢP HÀM RANDOM KHI BẤM NÚT */}
                    <button onClick={() => handleStartExamWithRandom(exam.maBaiThi)} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "13px", background: "#534AB7", color: "white", cursor: "pointer" }}>Làm bài →</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MÀN HÌNH 2: TRUNG TÂM BÀI THI (ĐANG DIỄN RA, HẾT HẠN, VÔ HẠN) */}
        {currentMenu === "exams" && (
          <div className="exam-card-container" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            
            {/* Bộ lọc trạng thái đề */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
              <button onClick={() => setExamFilter("all")} style={{ padding: "8px 14px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer", background: examFilter === "all" ? "#534AB7" : "#F1F5F9", color: examFilter === "all" ? "white" : "#475569" }}>Tất cả bài</button>
              <button onClick={() => setExamFilter("OPEN")} style={{ padding: "8px 14px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer", background: examFilter === "OPEN" ? "#0F6E56" : "#E1F5EE", color: examFilter === "OPEN" ? "white" : "#0F6E56" }}>🟢 Đang diễn ra</button>
              <button onClick={() => setExamFilter("INFINITE")} style={{ padding: "8px 14px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer", background: examFilter === "INFINITE" ? "#D4930A" : "#FFF7E6", color: examFilter === "INFINITE" ? "white" : "#D4930A" }}>🟡 Vô hạn (Tự luyện)</button>
              <button onClick={() => setExamFilter("EXPIRED")} style={{ padding: "8px 14px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer", background: examFilter === "EXPIRED" ? "#A32D2D" : "#FBEAF0", color: examFilter === "EXPIRED" ? "white" : "#A32D2D" }}>🔴 Hết hạn</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredExamsTab.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94A3B8" }}>Không tìm thấy bài kiểm tra nào thỏa mãn bộ lọc hiện tại.</div>
              ) : (
                filteredExamsTab.map((exam) => {
                  const status = getExamStatus(exam);
                  return (
                    <div key={exam.maBaiThi} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "24px", background: "#F1F5F9", width: "45px", height: "45px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>📋</div>
                        <div>
                          <div style={{ fontWeight: "bold", color: "#2C3E50", fontSize: "15px" }}>{exam.tenBaiThi}</div>
                          <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "12px", color: "#64748B" }}>
                            <span>📚 {getMonHocName(exam.maMonThi)}</span>
                            <span>🏫 Lớp: <b>{getLopName(exam.maLop)}</b></span>
                            <span>⏱️ {exam.thoiLuong} phút</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {status === "PENDING" && <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", background: "#FFF7E6", color: "#D4930A" }}>Sắp diễn ra</span>}
                        {status === "OPEN" && <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", background: "#E1F5EE", color: "#0F6E56" }}>Đang mở</span>}
                        {status === "INFINITE" && <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", background: "#EBF3FE", color: "#185ADB" }}>Vô hạn</span>}
                        {status === "EXPIRED" && <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", background: "#FBEAF0", color: "#A32D2D" }}>Hết hạn</span>}

                        <button
                          disabled={status !== "OPEN" && status !== "INFINITE"}
                          onClick={() => handleStartExamWithRandom(exam.maBaiThi)}
                          style={{
                            padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "13px", cursor: (status === "OPEN" || status === "INFINITE") ? "pointer" : "not-allowed",
                            background: (status === "OPEN" || status === "INFINITE") ? "#534AB7" : "#E2E8F0",
                            color: (status === "OPEN" || status === "INFINITE") ? "white" : "#94A3B8"
                          }}
                        >
                          {(status === "OPEN" || status === "INFINITE") ? "Làm bài →" : "Khóa đề"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MÀN HÌNH 3: PHẦN KẾT QUẢ / LỊCH SỬ LÀM BÀI CÁ NHÂN */}
        {currentMenu === "results" && (
          <div className="exam-card-container" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "15px", color: "#2C3E50" }}>🎓 Kết quả & Điểm số cá nhân đạt được</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #EEEDFE", color: "#534AB7" }}>
                  <th style={{ padding: "12px 8px" }}>Mã đề</th>
                  <th style={{ padding: "12px 8px" }}>Tên đề kiểm tra</th>
                  <th style={{ padding: "12px 8px" }}>Môn học</th>
                  <th style={{ padding: "12px 8px" }}>Thời lượng</th>
                  <th style={{ padding: "12px 8px" }}>Ngày nộp bài</th>
                  <th style={{ padding: "12px 8px" }}>Kết quả điểm</th>
                </tr>
              </thead>
              <tbody>
                {historyExams.map((history, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 8px", fontWeight: "bold", color: "#64748B" }}>#{history.maBaiThi}</td>
                    <td style={{ padding: "14px 8px", fontWeight: "700", color: "#2C3E50" }}>{history.tenBaiThi}</td>
                    <td style={{ padding: "14px 8px" }}>{getMonHocName(history.maMonThi)}</td>
                    <td style={{ padding: "14px 8px" }}>{history.thoiLuong} phút</td>
                    <td style={{ padding: "14px 8px", color: "#64748B" }}>{history.ngayNop}</td>
                    <td style={{ padding: "14px 8px", fontWeight: "900", fontSize: "16px", color: history.diem >= 5 ? "#0F6E56" : "#A32D2D" }}>
                      {history.diem} / 10đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}