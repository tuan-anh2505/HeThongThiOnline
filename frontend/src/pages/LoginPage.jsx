// ============================================================
//  pages/LoginPage.jsx
// ============================================================
import { useState } from "react";
import { login } from "../services/api";
import { validateLoginForm } from "../utils/helpers";

export default function LoginPage({ onLogin }) {
  const [form,    setForm]    = useState({ tenDangNhap: "", matKhau: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");
  const [showPw,  setShowPw]  = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const handleSubmit = async () => {
    const errs = validateLoginForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiErr("");
    try {
      await login(form.tenDangNhap, form.matKhau);
      onLogin();
    } catch (e) {
      setApiErr("Sai tên đăng nhập hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.blob1} /><div style={S.blob2} /><div style={S.blob3} />

      <div style={S.card}>
        {/* Logo */}
        <div style={S.logoRow}>
          <span style={{ fontSize: 36 }}>🎓</span>
          <div>
            <div style={S.logoTitle}>ExamOnline</div>
            <div style={S.logoSub}>Trường ĐH Hàng Hải Việt Nam</div>
          </div>
        </div>
        <div style={S.divider} />

        <div style={S.title}>Chào mừng trở lại!</div>
        <div style={S.sub}>Đăng nhập để tiếp tục</div>

        {/* Username */}
        <Field label="Tên đăng nhập" error={errors.tenDangNhap}>
          <InputBox icon="👤">
            <input style={S.input} placeholder="Nhập tên đăng nhập..."
              value={form.tenDangNhap}
              onChange={e => set("tenDangNhap", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </InputBox>
        </Field>

        {/* Password */}
        <Field label="Mật khẩu" error={errors.matKhau}>
          <InputBox icon="🔒">
            <input style={S.input} placeholder="Nhập mật khẩu..."
              type={showPw ? "text" : "password"}
              value={form.matKhau}
              onChange={e => set("matKhau", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            <span style={S.eye} onClick={() => setShowPw(v => !v)}>{showPw ? "🙈" : "👁️"}</span>
          </InputBox>
        </Field>

        {apiErr && <div style={S.apiErr}>⚠️ {apiErr}</div>}

        <button style={{ ...S.btnLogin, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
        </button>

        <div style={S.roleRow}>
          {["👨‍🎓 Sinh viên", "👨‍🏫 Giảng viên", "⚙️ Admin"].map(r => (
            <span key={r} style={S.roleChip}>{r}</span>
          ))}
        </div>
      </div>

      <div style={S.footer}>© 2026 Khoa CNTT — Trường ĐH Hàng Hải Việt Nam</div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={S.label}>{label}</label>
      {children}
      {error && <div style={S.fieldErr}>{error}</div>}
    </div>
  );
}
function InputBox({ icon, children }) {
  return (
    <div style={S.inputBox}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {children}
    </div>
  );
}

const S = {
  page:      { minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
               justifyContent:"center", background:"linear-gradient(135deg,#f0effe,#e1f5ee,#fbeaf0)",
               fontFamily:"'Nunito',sans-serif", position:"relative", overflow:"hidden", padding:20 },
  blob1:     { position:"absolute", top:-80, left:-80, width:300, height:300, borderRadius:"50%",
               background:"rgba(127,119,221,0.15)", filter:"blur(40px)" },
  blob2:     { position:"absolute", bottom:-60, right:-60, width:260, height:260, borderRadius:"50%",
               background:"rgba(29,158,117,0.12)", filter:"blur(40px)" },
  blob3:     { position:"absolute", top:"40%", right:"10%", width:160, height:160, borderRadius:"50%",
               background:"rgba(212,83,126,0.1)", filter:"blur(30px)" },
  card:      { background:"white", borderRadius:28, padding:"40px 36px", width:"100%", maxWidth:420,
               boxShadow:"0 20px 60px rgba(127,119,221,0.18)", position:"relative", zIndex:1 },
  logoRow:   { display:"flex", alignItems:"center", gap:12, marginBottom:20 },
  logoTitle: { fontFamily:"'Baloo 2',sans-serif", fontSize:22, fontWeight:800, color:"#3C3489" },
  logoSub:   { fontSize:11, color:"#888780", fontWeight:600 },
  divider:   { height:1, background:"#EEEDFE", margin:"0 0 24px" },
  title:     { fontFamily:"'Baloo 2',sans-serif", fontSize:20, fontWeight:800, color:"#2C2C2A", marginBottom:4 },
  sub:       { fontSize:13, color:"#888780", fontWeight:600, marginBottom:24 },
  label:     { fontSize:13, fontWeight:700, color:"#444441", display:"block", marginBottom:6 },
  inputBox:  { display:"flex", alignItems:"center", gap:10, background:"#F8F7FF",
               border:"2px solid #EEEDFE", borderRadius:14, padding:"0 14px" },
  input:     { flex:1, border:"none", background:"transparent", padding:"12px 0", fontSize:14,
               fontFamily:"'Nunito',sans-serif", fontWeight:600, color:"#2C2C2A", outline:"none" },
  eye:       { cursor:"pointer", fontSize:16, flexShrink:0 },
  fieldErr:  { fontSize:12, color:"#E24B4A", fontWeight:600, marginTop:4 },
  apiErr:    { background:"#FCEBEB", border:"1px solid #F09595", borderRadius:12,
               padding:"10px 14px", fontSize:13, fontWeight:700, color:"#A32D2D", marginBottom:16 },
  btnLogin:  { width:"100%", background:"linear-gradient(135deg,#7F77DD,#534AB7)", color:"white",
               border:"none", borderRadius:16, padding:14, fontSize:15,
               fontFamily:"'Nunito',sans-serif", fontWeight:800, cursor:"pointer", marginBottom:20,
               boxShadow:"0 6px 20px rgba(127,119,221,0.4)" },
  roleRow:   { display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" },
  roleChip:  { background:"#F8F7FF", border:"1px solid #EEEDFE", borderRadius:20,
               padding:"4px 12px", fontSize:11, fontWeight:700, color:"#888780" },
  footer:    { marginTop:24, fontSize:12, color:"#B4B2A9", fontWeight:600,
               textAlign:"center", position:"relative", zIndex:1 },
};
