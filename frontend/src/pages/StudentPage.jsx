// ============================================================
//  pages/StudentPage.jsx
// ============================================================
import { useState, useEffect } from "react";
import { getDashboardStudent, getDashboardStudentByClass, getHoTen } from "../services/api";
import { MOCK_DASHBOARD_STUDENT } from "../utils/mockData";
import { formatToday, diemColor } from "../utils/helpers";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

export default function StudentPage({ onLogout, onStartExam }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selCls, setSelCls] = useState(null);
  const [classLoading, setClassLoading] = useState(false);
  const [section, setSection] = useState("exams"); // home | exams | grades
  const [tab, setTab] = useState("valid");
  const [search, setSearch] = useState("");
  const hoTen = getHoTen();

  useEffect(() => {
    getDashboardStudent()
      .then(d => {
        setData(d);
        setSelCls(d.selectedClass || d.classes?.[0]);
      })
      .catch(() => {
        setData(MOCK_DASHBOARD_STUDENT);
        setSelCls(MOCK_DASHBOARD_STUDENT.classes[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClassClick = async (className) => {
    setSelCls(className);
    setSearch("");
    setClassLoading(true);
    try {
      const next = await getDashboardStudentByClass(className);
      setData(prev => ({
        ...prev,
        examsValid: next.examsValid || [],
        examsExpired: next.examsExpired || [],
        selectedClass: next.selectedClass || className,
      }));
    } catch {
      setData(prev => ({
        ...prev,
        examsValid: MOCK_DASHBOARD_STUDENT.examsValid || [],
        examsExpired: MOCK_DASHBOARD_STUDENT.examsExpired || [],
        selectedClass: className,
      }));
    } finally {
      setClassLoading(false);
    }
  };

  if (loading) return <Loader />;

  const expired = data.examsExpired || [];
  const valid = data.examsValid || [];
  const completed = expired.filter(e => e.diem != null || e.daNop);
  const avgDiem = completed.length
    ? (completed.reduce((s, e) => s + (Number(e.diem) || 0), 0) / completed.length).toFixed(1)
    : "--";
  const maxDiem = completed.length ? Math.max(...completed.map(e => Number(e.diem) || 0)) : "--";

  const examList = (tab === "valid" ? valid : expired)
    .filter(e => e.tenBaiThi?.toLowerCase().includes(search.toLowerCase())
      || e.tenMonThi?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={L.page}>
      <Sidebar
        title="ExamOnline"
        items={[
          { id: "home", icon: "🏠", label: "Trang chủ" },
          { id: "exams", icon: "📝", label: "Bài thi" },
          { id: "grades", icon: "⭐", label: "Kết quả" },
        ]}
        active={section}
        onItemClick={id => setSection(id)}
        hoTen={hoTen}
        roleLabel="👨‍🎓 Sinh viên"
        onLogout={onLogout}
        extra={
          <div>
            <div style={L.sideLabel}>LỚP HỌC</div>
            {(data.classes || []).map(c => (
              <div
                key={c}
                style={{ ...L.clsItem, ...(selCls === c ? L.clsActive : {}) }}
                onClick={() => handleClassClick(c)}
              >
                📚 {c}
              </div>
            ))}
          </div>
        }
      />

      <main style={L.main}>
        {/* TRANG CHỦ */}
        {section === "home" && (
          <div>
            <div style={L.greeting}>🏠 Trang chủ</div>
            <div style={L.sub}>{formatToday()}</div>
            <div style={{ ...L.statRow, marginTop: 24 }}>
              <StatCard icon="📝" label="Bài thi đang mở" value={valid.length} color="purple" />
              <StatCard icon="✅" label="Đã hoàn thành" value={completed.length} color="teal" />
              <StatCard icon="⭐" label="Điểm trung bình" value={avgDiem} color="amber" />
              <StatCard icon="🏆" label="Điểm cao nhất" value={maxDiem} color="pink" />
            </div>
            <div style={L.homeCard}>
              <div style={L.homeCardTitle}>📋 Bài thi sắp diễn ra</div>
              {valid.length === 0 && <div style={L.empty}>Không có bài thi nào đang mở</div>}
              {valid.slice(0, 3).map(exam => (
                <ExamCard key={exam.maBaiThi} exam={exam} onStart={onStartExam} />
              ))}
              {valid.length > 3 && (
                <button style={L.viewAll} onClick={() => setSection("exams")}>
                  Xem tất cả {valid.length} bài thi →
                </button>
              )}
            </div>
          </div>
        )}

        {/* BÀI THI */}
        {section === "exams" && (
          <div>
            <div style={L.header}>
              <div>
                <div style={L.greeting}>📝 Bài thi</div>
                <div style={L.sub}>Lớp: <strong>{selCls}</strong> · {formatToday()}</div>
              </div>
            </div>
            <div style={L.statRow}>
              <StatCard icon="📝" label="Đang mở" value={valid.length} color="purple" />
              <StatCard icon="✅" label="Đã làm" value={completed.length} color="teal" />
              <StatCard icon="⭐" label="Điểm TB" value={avgDiem} color="amber" />
              <StatCard icon="🏆" label="Điểm cao nhất" value={maxDiem} color="pink" />
            </div>
            <div style={L.toolbar}>
              <div style={L.tabs}>
                <TabBtn active={tab === "valid"} onClick={() => setTab("valid")}>
                  🟢 Đang mở ({valid.length})
                </TabBtn>
                <TabBtn active={tab === "expired"} onClick={() => setTab("expired")}>
                  🔴 Đã kết thúc ({expired.length})
                </TabBtn>
              </div>
              <input
                style={L.search}
                placeholder="🔍 Tìm bài thi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {classLoading && <div style={L.loadingLine}>Đang tải bài thi của lớp...</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {examList.length === 0 && <Empty />}
              {examList.map(exam => (
                <ExamCard key={exam.maBaiThi} exam={exam} onStart={onStartExam} />
              ))}
            </div>
          </div>
        )}

        {/* KẾT QUẢ */}
        {section === "grades" && (
          <div>
            <div style={L.greeting}>⭐ Kết quả của tôi</div>
            <div style={L.sub}>Lịch sử các bài thi đã hoàn thành</div>
            <div style={{ ...L.statRow, marginTop: 20 }}>
              <StatCard icon="✅" label="Bài đã làm" value={completed.length} color="teal" />
              <StatCard icon="⭐" label="Điểm TB" value={avgDiem} color="amber" />
              <StatCard icon="🏆" label="Điểm cao nhất" value={maxDiem} color="pink" />
              <StatCard
                icon="❌"
                label="Chưa đạt"
                value={completed.filter(e => Number(e.diem) < 5).length}
                color="red"
              />
            </div>
            <div style={L.homeCard}>
              <div style={L.homeCardTitle}>📋 Lịch sử bài thi</div>
              {completed.length === 0 && <Empty />}
              {completed.map((exam, i) => (
                <div key={exam.maBaiThi} style={GR.row}>
                  <div style={GR.rank}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={GR.title}>{exam.tenBaiThi}</div>
                    <div style={GR.meta}>📚 {exam.tenMonThi} · ⏱️ {exam.thoiLuong} phút</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...GR.score, color: diemColor(exam.diem) }}>
                      {exam.diem ?? "—"}
                    </div>
                    <div style={GR.scoreLabel}>/10</div>
                    <span style={{
                      ...GR.badge,
                      background: exam.diem >= 5 ? "#E1F5EE" : "#FCEBEB",
                      color: exam.diem >= 5 ? "#085041" : "#A32D2D",
                    }}>
                      {exam.diem >= 5 ? "✅ Đạt" : "❌ Rớt"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ExamCard({ exam, onStart }) {
  return (
    <div style={EC.card}>
      <div style={EC.icon}>📋</div>
      <div style={{ flex: 1 }}>
        <div style={EC.title}>{exam.tenBaiThi}</div>
        <div style={EC.meta}>
          <span>📚 {exam.tenMonThi || "—"}</span>
          <span>⏱️ {exam.thoiLuong} phút</span>
          {exam.gioBatDau && <span>🕐 {exam.gioBatDau}–{exam.gioKetThuc}</span>}
          {exam.diem != null && <span style={{ fontWeight: 700, color: diemColor(exam.diem) }}>⭐ {exam.diem}/10</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <span style={exam.conHan ? EC.badgeOpen : EC.badgeClosed}>
          {exam.conHan ? "🟢 Đang mở" : "🔴 Hết hạn"}
        </span>
        {exam.conHan && (
          <button style={EC.btnStart} onClick={() => onStart(exam)}>Làm bài →</button>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button style={{ ...L.tab, ...(active ? L.tabActive : {}) }} onClick={onClick}>
      {children}
    </button>
  );
}

function Loader() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "'Nunito',sans-serif",
      fontSize: 18,
      color: "#7F77DD",
    }}>
      ⏳ Đang tải...
    </div>
  );
}

function Empty() {
  return (
    <div style={{
      textAlign: "center",
      padding: 40,
      color: "#B4B2A9",
      fontWeight: 700,
      fontSize: 15,
      background: "white",
      borderRadius: 16,
    }}>
      😔 Không có bài thi nào
    </div>
  );
}

const L = {
  page: { display: "flex", minHeight: "100vh", background: "#F0EFFE", fontFamily: "'Nunito',sans-serif" },
  main: { flex: 1, padding: "28px 32px", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting: { fontFamily: "'Baloo 2',sans-serif", fontSize: 24, fontWeight: 800, color: "#3C3489" },
  sub: { fontSize: 13, color: "#888780", fontWeight: 600, marginTop: 2 },
  statRow: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
    flexWrap: "wrap",
  },
  loadingLine: { fontSize: 12, color: "#7F77DD", fontWeight: 700, margin: "-6px 0 10px" },
  tabs: { display: "flex", gap: 8 },
  tab: {
    background: "white",
    border: "2px solid #EEEDFE",
    borderRadius: 12,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    color: "#888780",
  },
  tabActive: { background: "#7F77DD", borderColor: "#534AB7", color: "white" },
  search: {
    background: "white",
    border: "2px solid #EEEDFE",
    borderRadius: 12,
    padding: "8px 14px",
    fontSize: 13,
    fontFamily: "'Nunito',sans-serif",
    fontWeight: 600,
    outline: "none",
    width: 220,
  },
  sideLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "#B4B2A9",
    letterSpacing: 1,
    textTransform: "uppercase",
    margin: "8px 0 4px 4px",
  },
  clsItem: { padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#444441" },
  clsActive: { background: "#EEEDFE", color: "#3C3489", fontWeight: 700 },
  homeCard: {
    background: "white",
    borderRadius: 16,
    padding: "20px 24px",
    boxShadow: "0 2px 12px rgba(127,119,221,0.08)",
    border: "1px solid #EEEDFE",
  },
  homeCardTitle: { fontFamily: "'Baloo 2',sans-serif", fontSize: 16, fontWeight: 800, color: "#3C3489", marginBottom: 16 },
  viewAll: {
    background: "#EEEDFE",
    border: "none",
    borderRadius: 12,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 700,
    color: "#534AB7",
    cursor: "pointer",
    width: "100%",
    marginTop: 12,
  },
  empty: { textAlign: "center", padding: 32, color: "#B4B2A9", fontWeight: 700 },
};

const EC = {
  card: {
    background: "white",
    borderRadius: 16,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 2px 12px rgba(127,119,221,0.08)",
    border: "1px solid #EEEDFE",
    marginBottom: 10,
  },
  icon: {
    fontSize: 28,
    width: 48,
    height: 48,
    background: "#F8F7FF",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: 700, color: "#2C2C2A", marginBottom: 6 },
  meta: { display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#888780", fontWeight: 600 },
  badgeOpen: {
    background: "#E1F5EE",
    color: "#085041",
    border: "1px solid #5DCAA5",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 700,
  },
  badgeClosed: {
    background: "#FCEBEB",
    color: "#A32D2D",
    border: "1px solid #F09595",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 700,
  },
  btnStart: {
    background: "linear-gradient(135deg,#7F77DD,#534AB7)",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(127,119,221,0.3)",
  },
};

const GR = {
  row: { display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid #EEEDFE" },
  rank: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#EEEDFE",
    color: "#534AB7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: 700, color: "#2C2C2A", marginBottom: 4 },
  meta: { fontSize: 12, color: "#888780", fontWeight: 600 },
  score: { fontFamily: "'Baloo 2',sans-serif", fontSize: 24, fontWeight: 800 },
  scoreLabel: { fontSize: 11, color: "#B4B2A9" },
  badge: { borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, display: "inline-block", marginTop: 4 },
};
