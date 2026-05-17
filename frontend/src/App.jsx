// ============================================================
//  App.jsx  —  Router chính + nút đăng xuất mọi trang
// ============================================================
import { useState, useEffect } from "react";
import { isLoggedIn, checkAndLogout } from "./utils/auth";
import { getVaiTro, getHoTen, logout as logoutApi } from "./services/api";

import LoginPage     from "./pages/LoginPage";
import StudentPage   from "./pages/StudentPage";
import TeacherPage   from "./pages/TeacherPage";
import AdminPage     from "./pages/AdminPage";
import ExamPage      from "./pages/ExamPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LogoutButton  from "./components/LogoutButton";

const ROLE_LABEL = {
  0: "⚙️ Quản trị viên",
  1: "👨‍🏫 Giảng viên",
  2: "👨‍🎓 Sinh viên",
};

export default function App() {
  const [page,    setPage]    = useState("login");
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    if (isLoggedIn()) {
      const expired = checkAndLogout(() => setPage("login"));
      if (!expired) redirectByRole();
    }
  }, []);

  function redirectByRole() {
    const role = getVaiTro();
    if (role === 0) setPage("admin");
    else if (role === 1) setPage("teacher");
    else setPage("student");
  }

  function handleLogin()   { redirectByRole(); }
  async function handleLogout()  {
    try {
      await logoutApi();
    } finally {
      setPage("login");
      setPayload(null);
    }
  }
  function goExam(bt)      { setPayload(bt); setPage("exam"); }
  function goAnalytics(bt) { setPayload(bt); setPage("analytics"); }
  function goBack()        { setPayload(null); redirectByRole(); }

  const loggedIn  = page !== "login";
  const hoTen     = getHoTen() || "";
  const vaiTro    = getVaiTro();
  const roleLabel = ROLE_LABEL[vaiTro] || "";

  return (
    <div>
      {/* Nút đăng xuất nổi — hiện ở mọi trang trừ Login và ExamPage */}
      {loggedIn && page !== "exam" && (
        <LogoutButton
          onLogout={handleLogout}
          hoTen={hoTen}
          roleLabel={roleLabel}
        />
      )}

      {page === "login"     && <LoginPage     onLogin={handleLogin} />}
      {page === "student"   && <StudentPage   onLogout={handleLogout} onStartExam={goExam} />}
      {page === "teacher"   && <TeacherPage   onLogout={handleLogout} onViewAnalytics={goAnalytics} />}
      {page === "admin"     && <AdminPage     onLogout={handleLogout} />}
      {page === "exam"      && <ExamPage      exam={payload} onBack={goBack} />}
      {page === "analytics" && <AnalyticsPage exam={payload} onBack={goBack} />}
    </div>
  );
}
