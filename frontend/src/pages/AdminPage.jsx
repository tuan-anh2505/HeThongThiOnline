// ============================================================
//  pages/AdminPage.jsx  — Kết nối thật với backend/database
// ============================================================
import { useState, useEffect } from "react";
import { 
  getAllUsers, createUser, updateUser, deleteUser, 
  getAllLogs, getUserLogs,
  getAllSubjects, createSubject, updateSubject, deleteSubject,
  getAllClasses, createClass, updateClass, deleteClass,
  getAllShifts, createShift, updateShift, deleteShift
} from "../services/api";
import { getHoTen } from "../services/api";
import { validateUserForm, nameToGradient } from "../utils/helpers";
import Sidebar      from "../components/Sidebar";
import StatCard     from "../components/StatCard";
import Modal        from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

const ROLE_MAP = {
  0: { label:"Admin",      bg:"#FAEEDA", color:"#633806", icon:"⚙️"  },
  1: { label:"Giảng viên", bg:"#E1F5EE", color:"#085041", icon:"👨‍🏫" },
  2: { label:"Sinh viên",  bg:"#EEEDFE", color:"#3C3489", icon:"👨‍🎓" },
};

const LOG_STYLE = {
  LOGIN:               { icon:"🔑", bg:"#E1F5EE", color:"#085041" },
  LOGOUT:              { icon:"🚪", bg:"#F1EFE8", color:"#444441" },
  START_EXAM:          { icon:"▶️",  bg:"#EEEDFE", color:"#3C3489" },
  SUBMIT_EXAM:         { icon:"✅",  bg:"#E1F5EE", color:"#085041" },
  COPY_PASTE:          { icon:"⚠️",  bg:"#FAEEDA", color:"#633806" },
  TAB_SWITCH:          { icon:"🔴",  bg:"#FCEBEB", color:"#A32D2D" },
};

function getLogStyle(action) {
  if (action.startsWith("VIEW_")) return { icon: "👁️", bg: "#EEEDFE", color: "#534AB7" };
  if (action.startsWith("UPDATE_")) return { icon: "✏️", bg: "#FFF7E6", color: "#D4930A" };
  if (action.startsWith("CREATE_")) return { icon: "➕", bg: "#E1F5EE", color: "#085041" };
  if (action.startsWith("DELETE_")) return { icon: "🗑️", bg: "#FCEBEB", color: "#A32D2D" };
  if (action.startsWith("START_EXAM")) return { icon: "▶️", bg: "#EEEDFE", color: "#3C3489" };
  if (action.startsWith("SUBMIT_EXAM")) return { icon: "✅", bg: "#E1F5EE", color: "#085041" };
  const key = Object.keys(LOG_STYLE).find(k => action.startsWith(k));
  return LOG_STYLE[key] || { icon:"📌", bg:"#F1EFE8", color:"#444441" };
}

function getActionText(action) {
  if (!action) return "Thao tác không xác định";
  if (action === "LOGIN") return "Đăng nhập hệ thống";
  if (action === "LOGOUT") return "Đăng xuất hệ thống";
  if (action === "VIEW_ALL_USERS") return "Xem danh sách tài khoản";
  if (action === "VIEW_ALL_LOGS") return "Xem nhật ký hệ thống";
  if (action === "COPY_PASTE") return "Phát hiện gian lận (Copy/Paste)";
  if (action === "TAB_SWITCH") return "Phát hiện gian lận (Đổi tab)";
  
  if (action.startsWith("UPDATE_USER_")) return `Cập nhật tài khoản #${action.split("_").pop()}`;
  if (action.startsWith("CREATE_USER_")) return `Tạo tài khoản #${action.split("_").pop()}`;
  if (action.startsWith("DELETE_USER_")) return `Xóa tài khoản #${action.split("_").pop()}`;
  if (action.startsWith("VIEW_USER_LOGS_")) return `Xem nhật ký của tài khoản #${action.split("_").pop()}`;
  if (action.startsWith("CREATE_EXAM_")) return `Khởi tạo đề thi #${action.split("_").pop()}`;
  if (action.startsWith("UPDATE_EXAM_")) return `Cập nhật đề thi #${action.split("_").pop()}`;
  if (action.startsWith("DELETE_EXAM_")) return `Xóa đề thi #${action.split("_").pop()}`;
  if (action.startsWith("START_EXAM_")) return `Bắt đầu làm đề thi #${action.split("_").pop()}`;
  if (action.startsWith("SUBMIT_EXAM_")) return `Nộp bài đề thi #${action.split("_").pop()}`;
  
  return action;
}

export default function AdminPage({ onLogout }) {
  const [section,  setSection]  = useState("users");
  
  const [users,    setUsers]    = useState([]);
  const [logs,     setLogs]     = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [shifts,   setShifts]   = useState([]);

  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [roleF,    setRoleF]    = useState("all");
  
  const [modal,    setModal]    = useState(null); 
  const [confirm,  setConfirm]  = useState(null); 
  const [logUser,  setLogUser]  = useState(null);
  const [toast,    setToast]    = useState("");
  
  const hoTen = getHoTen();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      const u = await getAllUsers();
      setUsers(Array.isArray(u) ? u : []);

      const l = await getAllLogs();
      setLogs((Array.isArray(l) ? l : []).sort((a,b) => new Date(b.thoiGian) - new Date(a.thoiGian)));

      const sub = await getAllSubjects();
      setSubjects(Array.isArray(sub) ? sub : []);

      const cls = await getAllClasses();
      setClasses(Array.isArray(cls) ? cls : []);

      const shf = await getAllShifts();
      setShifts(Array.isArray(shf) ? shf : []);
    } catch (err) {
      console.error("Lỗi đồng bộ danh mục:", err);
      setError("❌ Hệ thống gặp sự cố kết nối danh mục: " + (err.message || "Vui lòng xem Console"));
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === 'user') {
        await deleteUser(confirm.id);
        setUsers(u => u.filter(x => x.maTaiKhoan !== confirm.id));
      } else if (confirm.type === 'subject') {
        await deleteSubject(confirm.id);
        setSubjects(s => s.filter(x => x.maMonThi !== confirm.id));
      } else if (confirm.type === 'class') {
        await deleteClass(confirm.id);
        setClasses(c => c.filter(x => x.maLop !== confirm.id));
      } else if (confirm.type === 'shift') {
        await deleteShift(confirm.id);
        setShifts(s => s.filter(x => x.maCaThi !== confirm.id));
      }
      showToast("🗑️ Xóa dữ liệu thành công!");
    } catch (e) {
      setError("❌ Không thể xóa bản ghi do ràng buộc dữ liệu khóa ngoại!");
    } finally { setConfirm(null); }
  };

  const handleSaveCategory = async (type, form, isEdit, setSaving) => {
    setSaving(true);
    try {
      if (type === 'subject') {
        if (isEdit) {
          const res = await updateSubject(form.maMonThi, form);
          setSubjects(prev => prev.map(x => x.maMonThi === res.maMonThi ? res : x));
        } else {
          const res = await createSubject(form);
          setSubjects(prev => [res, ...prev]);
        }
      } else if (type === 'class') {
        if (isEdit) {
          const res = await updateClass(form.maLop, form);
          setClasses(prev => prev.map(x => x.maLop === res.maLop ? res : x));
        } else {
          const res = await createClass(form);
          setClasses(prev => [res, ...prev]);
        }
      } else if (type === 'shift') {
        if (isEdit) {
          const res = await updateShift(form.maCaThi, form);
          setShifts(prev => prev.map(x => x.maCaThi === res.maCaThi ? res : x));
        } else {
          const res = await createShift(form);
          setShifts(prev => [res, ...prev]);
        }
      }
      setModal(null);
      showToast("✅ Lưu danh mục thành công!");
    } catch (e) {
      setError("❌ Gặp lỗi trong quá trình lưu dữ liệu danh mục.");
    } finally { setSaving(false); }
  };

  const handleSaveUser = async (form, isEdit, setModalError, setSaving) => {
    setSaving(true);
    try {
      if (isEdit) {
        const updated = await updateUser(form.maTaiKhoan, form);
        setUsers(prev => prev.map(u => u.maTaiKhoan === updated.maTaiKhoan ? updated : u));
        setModal(null);
        showToast("✅ Cập nhật tài khoản thành công!");
      } else {
        const created = await createUser(form);
        setUsers(prev => [created, ...prev]);
        setModal(null);
        showToast("✅ Tạo tài khoản thành công!");
      }
    } catch (e) {
      setModalError("❌ Có lỗi xảy ra khi cập nhật tài khoản.");
    } finally { setSaving(false); }
  };

  return (
    <div style={L.page}>
      {toast && <div style={L.toast}>{toast}</div>}

      <Sidebar
        title="ExamOnline" titleColor="#993C1D"
        items={[
          {id:"users",icon:"👤",label:"Quản lý tài khoản"},
          {id:"subjects",icon:"📚",label:"Quản lý môn học"},
          {id:"classes",icon:"🏫",label:"Quản lý lớp học"},
          {id:"shifts",icon:"⏰",label:"Quản lý ca thi"},
          {id:"logs",icon:"📋",label:"Nhật ký hệ thống"}
        ]}
        active={section}
        onItemClick={id => { setSection(id); setSearch(""); setError(""); }}
        hoTen={hoTen} roleLabel="⚙️ Quản trị viên"
        avatarGradient="linear-gradient(135deg,#D85A30,#993C1D)"
        onLogout={onLogout} bgColor="#FFF5F0" borderColor="#FAECE7"
      />

      <main style={L.main}>
        <div style={L.header}>
          <div>
            <div style={{...L.greeting,color:"#993C1D"}}>
              {section==="users" && "👥 Quản lý tài khoản"}
              {section==="subjects" && "📚 Quản lý Môn học"}
              {section==="classes" && "🏫 Quản lý Lớp học"}
              {section==="shifts" && "⏰ Quản lý Ca thi"}
              {section==="logs" && "📋 Nhật ký hệ thống"}
            </div>
            <div style={L.sub}>Hệ thống quản lý dữ liệu danh mục lõi</div>
          </div>
          {section === "users" && <button style={L.btnAdd} onClick={() => setModal({type: 'user'})}>➕ Thêm tài khoản</button>}
          {section === "subjects" && <button style={L.btnAdd} onClick={() => setModal({type: 'subject'})}>➕ Thêm môn học</button>}
          {section === "classes" && <button style={L.btnAdd} onClick={() => setModal({type: 'class'})}>➕ Thêm lớp học</button>}
          {section === "shifts" && <button style={L.btnAdd} onClick={() => setModal({type: 'shift'})}>➕ Thêm ca thi</button>}
        </div>

        {error && (
          <div style={L.errorBanner}>
            {error} <button onClick={()=>setError("")} style={L.errorClose}>✕</button>
          </div>
        )}

        <div style={L.toolbar}>
          <div style={L.tabs}>
            {section==="users" && [{v:"all",l:"Tất cả"},{v:"0",l:"⚙️ Admin"},{v:"1",l:"👨‍🏫 GV"},{v:"2",l:"👨‍🎓 SV"}].map(({v,l})=>(
              <TabBtn key={v} active={roleF===v} accent="#D85A30" border="#FAECE7" onClick={()=>setRoleF(v)}>{l}</TabBtn>
            ))}
          </div>
          {section !== "logs" && (
            <input style={{...L.search, border:"2px solid #FAECE7"}} placeholder="🔍 Tìm kiếm nhanh..." value={search} onChange={e=>setSearch(e.target.value)} />
          )}
        </div>

        {/* BẢNG TÀI KHOẢN */}
        {section === "users" && (
          <div style={L.tableWrap}>
            <table style={L.table}>
              <thead><tr style={{background:"#FFF5F0"}}>
                {["ID","Họ tên","Tên đăng nhập","Email","Vai trò","Thao tác"].map(h=><th key={h} style={L.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {users.filter(u => (roleF === "all" || u.vaiTro === Number(roleF)) && (u.hoTen?.toLowerCase().includes(search.toLowerCase()))).map(u => {
                  const r = ROLE_MAP[u.vaiTro] || ROLE_MAP[2];
                  return (
                    <tr key={u.maTaiKhoan} style={L.tr}>
                      <td style={L.td}><span style={L.idChip}>#{u.maTaiKhoan}</span></td>
                      <td style={{...L.td, fontWeight:700}}>{u.hoTen}</td>
                      <td style={L.td}><code style={L.code}>{u.tenDangNhap}</code></td>
                      <td style={L.td}>{u.email}</td>
                      <td style={L.td}><span style={{background:r.bg,color:r.color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{r.label}</span></td>
                      <td style={L.td}>
                        <div style={{display:"flex",gap:6}}>
                          <ABtn color="edit" onClick={() => setModal({type: 'user', data: u})}>✏️</ABtn>
                          <ABtn color="del"  onClick={() => setConfirm({type: 'user', id: u.maTaiKhoan})}>🗑️</ABtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* BẢNG MÔN HỌC */}
        {section === "subjects" && (
          <div style={L.tableWrap}>
            <table style={L.table}>
              <thead><tr style={{background:"#FFF5F0"}}><th style={L.th}>Mã Môn</th><th style={L.th}>Tên Môn Học</th><th style={L.th}>Thao tác</th></tr></thead>
              <tbody>
                {subjects.filter(s => s.tenMonThi?.toLowerCase().includes(search.toLowerCase())).map(s => (
                  <tr key={s.maMonThi} style={L.tr}>
                    <td style={L.td}><span style={L.idChip}>#{s.maMonThi}</span></td>
                    <td style={{...L.td, fontWeight: 700, width: "100%"}}>{s.tenMonThi}</td>
                    <td style={L.td}>
                      <div style={{display:"flex",gap:6}}>
                        <ABtn color="edit" onClick={() => setModal({type: 'subject', data: s})}>✏️</ABtn>
                        <ABtn color="del"  onClick={() => setConfirm({type: 'subject', id: s.maMonThi})}>🗑️</ABtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BẢNG LỚP HỌC */}
        {section === "classes" && (
          <div style={L.tableWrap}>
            <table style={L.table}>
              <thead><tr style={{background:"#FFF5F0"}}><th style={L.th}>Mã Lớp</th><th style={L.th}>Tên Lớp Hành Chính</th><th style={L.th}>Thao tác</th></tr></thead>
              <tbody>
                {classes.filter(c => c.tenLop?.toLowerCase().includes(search.toLowerCase())).map(c => (
                  <tr key={c.maLop} style={L.tr}>
                    <td style={L.td}><span style={L.idChip}>#{c.maLop}</span></td>
                    <td style={{...L.td, fontWeight: 700, width: "100%"}}>{c.tenLop}</td>
                    <td style={L.td}>
                      <div style={{display:"flex",gap:6}}>
                        <ABtn color="edit" onClick={() => setModal({type: 'class', data: c})}>✏️</ABtn>
                        <ABtn color="del"  onClick={() => setConfirm({type: 'class', id: c.maLop})}>🗑️</ABtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BẢNG CA THI */}
        {section === "shifts" && (
          <div style={L.tableWrap}>
            <table style={L.table}>
              <thead><tr style={{background:"#FFF5F0"}}><th style={L.th}>Mã Ca</th><th style={L.th}>Tên Ca Thi</th><th style={L.th}>Giờ Mở Đề</th><th style={L.th}>Giờ Khóa Đề</th><th style={L.th}>Thao tác</th></tr></thead>
              <tbody>
                {shifts.map(s => (
                  <tr key={s.maCaThi} style={L.tr}>
                    <td style={L.td}><span style={L.idChip}>#{s.maCaThi}</span></td>
                    <td style={{...L.td, fontWeight: 700}}>{s.tenCaThi || `Ca thi số #${s.maCaThi}`}</td>
                    <td style={L.td}>{s.gioBatDau ? new Date(s.gioBatDau).toLocaleString("vi-VN") : "Chưa cài đặt"}</td>
                    <td style={L.td}>{s.gioKetThuc ? new Date(s.gioKetThuc).toLocaleString("vi-VN") : "Chưa cài đặt"}</td>
                    <td style={L.td}>
                      <div style={{display:"flex",gap:6}}>
                        <ABtn color="edit" onClick={() => setModal({type: 'shift', data: s})}>✏️</ABtn>
                        <ABtn color="del"  onClick={() => setConfirm({type: 'shift', id: s.maCaThi})}>🗑️</ABtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BẢNG LOGS */}
        {section === "logs" && (
          <div style={L.tableWrap}>
            <table style={L.table}>
              <thead><tr style={{background:"#FFF5F0"}}>
                {["#","Người dùng","Hành động / Thao tác","Thời gian","Địa chỉ IP mạng"].map(h=><th key={h} style={L.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {logs.slice(0, 100).map(log => {
                  const u = users.find(x => x.maTaiKhoan === log.maTaiKhoan);
                  const displayName = u ? u.hoTen : `Tài khoản #${log.maTaiKhoan}`;
                  const ls = getLogStyle(log.hanhDong || "");
                  const actionText = getActionText(log.hanhDong || "");
                  return (
                    <tr key={log.maLog} style={L.tr}>
                      <td style={L.td}><span style={L.idChip}>#{log.maLog}</span></td>
                      <td style={{...L.td,fontWeight:700}}>{displayName}</td>
                      <td style={L.td}><span style={{background:ls.bg,color:ls.color,borderRadius:8,padding:"5px 12px",fontSize:13,fontWeight:700}}>{actionText}</span></td>
                      <td style={L.td}>{log.thoiGian}</td>
                      <td style={L.td}><code style={L.code}>{log.diaChiIP || "—"}</code></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && modal.type !== 'user' && (
        <CategoryModal type={modal.type} data={modal.data} onClose={() => setModal(null)} onSave={(form, isEdit, setSaving) => handleSaveCategory(modal.type, form, isEdit, setSaving)} />
      )}

      {modal && modal.type === 'user' && (
        <UserModal user={modal.data} onClose={() => setModal(null)} onSave={handleSaveUser} />
      )}

      {confirm && (
        <ConfirmDialog msg="Xác nhận xóa vĩnh viễn mục đã chọn?" onOk={handleDelete} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}

function CategoryModal({ type, data, onClose, onSave }) {
  const isEdit = !!data;
  const [form, setForm] = useState(data || { tenCaThi: "", gioBatDau: "", gioKetThuc: "" });
  const [saving, setSaving] = useState(false);
  const titles = { subject: "Môn Học", class: "Lớp Học", shift: "Ca Thi" };
  
  const handleSave = () => {
    if (type === 'subject' && !form.tenMonThi) return alert("Hãy điền tên môn");
    if (type === 'class' && !form.tenLop) return alert("Hãy điền tên lớp");
    onSave(form, isEdit, setSaving);
  };

  return (
    <Modal title={`${isEdit ? "✏️ Chỉnh sửa" : "➕ Khởi tạo"} ${titles[type]}`} titleColor="#993C1D" onClose={onClose}>
      {type === 'subject' && (
        <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:700,display:"block",marginBottom:5}}>Tên Môn Học:</label><input style={INP} value={form.tenMonThi || ""} onChange={e => setForm({...form, tenMonThi: e.target.value})} placeholder="VD: Lập trình mạng..." /></div>
      )}
      {type === 'class' && (
        <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:700,display:"block",marginBottom:5}}>Tên Lớp Hành Chính:</label><input style={INP} value={form.tenLop || ""} onChange={e => setForm({...form, tenLop: e.target.value})} placeholder="VD: TTM63..." /></div>
      )}
      {type === 'shift' && (
        <>
          <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:700,display:"block",marginBottom:5}}>Tên Gọi Ca Thi:</label><input style={INP} value={form.tenCaThi || ""} onChange={e => setForm({...form, tenCaThi: e.target.value})} placeholder="VD: Ca thi số 1..." /></div>
          <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:700,display:"block",marginBottom:5}}>Mở mạng lúc (Datetime):</label><input type="datetime-local" style={INP} value={form.gioBatDau || ""} onChange={e => setForm({...form, gioBatDau: e.target.value})} /></div>
          <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:700,display:"block",marginBottom:5}}>Khóa mạng lúc (Datetime):</label><input type="datetime-local" style={INP} value={form.gioKetThuc || ""} onChange={e => setForm({...form, gioKetThuc: e.target.value})} /></div>
        </>
      )}
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:15}}>
        <button style={BTN.cancel} onClick={onClose} disabled={saving}>Huỷ</button>
        <button style={{...BTN.save,background:"linear-gradient(135deg,#D85A30,#993C1D)"}} onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu vào DB ✓"}</button>
      </div>
    </Modal>
  );
}

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user||{hoTen:"",tenDangNhap:"",email:"",soDienThoai:"",matKhau:"",vaiTro:2});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));};
  const isEdit=!!user;

  const handleSave=()=>{
    const errs=validateUserForm(form,!isEdit);
    if(Object.keys(errs).length){setErrors(errs);return;}
    onSave(form,isEdit,setModalError,setSaving);
  };

  return (
    <Modal title={isEdit?"✏️ Sửa tài khoản":"➕ Thêm tài khoản"} titleColor="#993C1D" onClose={onClose}>
      {[
        {k:"hoTen",l:"Họ tên"}, {k:"tenDangNhap",l:"Tên đăng nhập"},
        ...(!isEdit?[{k:"matKhau",l:"Mật khẩu",type:"password"}]:[]),
        {k:"email",l:"Email",type:"email"},{k:"soDienThoai",l:"Số điện thoại"}
      ].map(({k,l,type="text"})=>(
        // ĐÃ SỬA: Thêm dấu } bị thiếu ở chỗ errors[k]
        <FF key={k} label={l} error={errors[k]}>
            <input style={INP} type={type} value={form[k]||""} onChange={e=>set(k,e.target.value)} />
        </FF>
      ))}
      <FF label="Vai trò">
        <select style={INP} value={form.vaiTro} onChange={e=>set("vaiTro",Number(e.target.value))}>
          <option value={0}>⚙️ Admin</option><option value={1}>👨‍🏫 Giảng viên</option><option value={2}>👨‍🎓 Sinh viên</option>
        </select>
      </FF>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:10}}>
        <button style={BTN.cancel} onClick={onClose} disabled={saving}>Huỷ</button>
        <button style={{...BTN.save,background:"linear-gradient(135deg,#D85A30,#993C1D)"}} onClick={handleSave} disabled={saving}>Lưu ✓</button>
      </div>
    </Modal>
  );
}
function FF({label,error,children}){
  return <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:700,color:"#444441",display:"block",marginBottom:5}}>{label}</label>{children}</div>;
}
function TabBtn({active,onClick,accent,border,children}){
  return <button style={{background:active?accent:"white",color:active?"white":"#888780", border:`2px solid ${active?accent:border}`,borderRadius:12,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={onClick}>{children}</button>;
}
function ABtn({color,onClick,children}){
  const c={edit:{bg:"#EEEDFE",t:"#534AB7"},del:{bg:"#FCEBEB",t:"#A32D2D"}}[color];
  return <button style={{background:c.bg,color:c.t,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={onClick}>{children}</button>;
}
const INP={width:"100%",border:"2px solid #FAECE7",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",background:"#FFF5F0",boxSizing:"border-box"};
const BTN={
  cancel:{background:"white",border:"2px solid #FAECE7",borderRadius:12,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#888780"},
  save:  {background:"linear-gradient(135deg,#7F77DD,#534AB7)",color:"white",border:"none",borderRadius:12,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer"},
};
const L={
  page:       {display:"flex",minHeight:"100vh",background:"#FFF5F0",fontFamily:"'Nunito',sans-serif"},
  main:       {flex:1,padding:"28px 32px",overflowY:"auto"},
  header:     {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24},
  greeting:   {fontFamily:"'Baloo 2',sans-serif",fontSize:24,fontWeight:800},
  sub:        {fontSize:13,color:"#888780",fontWeight:600,marginTop:2},
  btnAdd:     {background:"linear-gradient(135deg,#D85A30,#993C1D)",color:"white",border:"none",borderRadius:14,padding:"10px 20px",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(216,90,48,0.35)"},
  statRow:    {display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"},
  toolbar:    {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:12,flexWrap:"wrap"},
  tabs:       {display:"flex",gap:8,flexWrap:"wrap"},
  search:     {background:"white",border:"2px solid #EEEDFE",borderRadius:12,padding:"8px 14px",fontSize:13,outline:"none",width:200},
  tableWrap:  {background:"white",borderRadius:16,overflow:"auto",boxShadow:"0 2px 12px rgba(216,90,48,0.08)",border:"1px solid #FAECE7"},
  table:      {width:"100%",borderCollapse:"collapse",minWidth:700},
  th:         {padding:"12px 16px",fontSize:11,fontWeight:700,color:"#888780",textAlign:"left",borderBottom:"1px solid #FAECE7",textTransform:"uppercase",letterSpacing:"0.5px"},
  tr:         {borderBottom:"1px solid #FFF5F0"},
  td:         {padding:"11px 16px",fontSize:13,color:"#444441"},
  idChip:     {background:"#F1EFE8",padding:"2px 8px",borderRadius:6,fontSize:12,fontWeight:700,color:"#888780"},
  code:       {background:"#F1EFE8",padding:"2px 6px",borderRadius:4,fontSize:12,color:"#444441"},
  errorBanner:{background:"#FCEBEB",border:"1px solid #F09595",borderRadius:12,padding:"12px 16px",fontSize:13,fontWeight:700,color:"#A32D2D",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"},
  errorClose: {background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#A32D2D",fontWeight:700,padding:0},
  toast:      {position:"fixed",top:20,right:24,background:"#065C49",color:"white",borderRadius:12,padding:"12px 20px",fontSize:14,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",zIndex:9999},
};