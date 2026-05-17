// ============================================================
//  pages/AdminPage.jsx  — Kết nối thật với backend/database
// ============================================================
import { useState, useEffect } from "react";
import { getAllUsers, createUser, updateUser, deleteUser, getAllLogs, getUserLogs } from "../services/api";
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
  COPY_PASTE_DETECTED: { icon:"⚠️",  bg:"#FAEEDA", color:"#633806" },
  TAB_SWITCH_DETECTED: { icon:"🔴",  bg:"#FCEBEB", color:"#A32D2D" },
  CREATE_EXAM:         { icon:"➕",  bg:"#EEEDFE", color:"#534AB7" },
  VIEW_ANALYTICS:      { icon:"📊",  bg:"#FBEAF0", color:"#72243E" },
};
function getLogStyle(action) {
  const key = Object.keys(LOG_STYLE).find(k => action.startsWith(k));
  return LOG_STYLE[key] || LOG_STYLE.LOGIN;
}

export default function AdminPage({ onLogout }) {
  const [section,  setSection]  = useState("users");
  const [users,    setUsers]    = useState([]);
  const [logs,     setLogs]     = useState([]);
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
      const [u, l] = await Promise.all([getAllUsers(), getAllLogs()]);
      setUsers(Array.isArray(u) ? u : []);
      setLogs(typeof l === "string" ? [] : (Array.isArray(l) ? l : []));
    } catch {
      setError("❌ Không thể kết nối tới server. Kiểm tra backend đang chạy tại localhost:8080");
    } finally { setLoading(false); }
  };

  const viewUserLog = async (user) => {
    setLogUser(user); setSection("logs"); setLoading(true); setError("");
    try {
      const l = await getUserLogs(user.maTaiKhoan);
      setLogs(Array.isArray(l) ? l : []);
    } catch { setError("❌ Không tải được log."); setLogs([]); }
    finally { setLoading(false); }
  };

  const handleSave = async (form, isEdit, setModalError, setSaving) => {
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
        showToast("✅ Tạo tài khoản thành công! Đã lưu vào database.");
      }
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("da ton tai") || msg.includes("already") || msg.includes("ton tai")) {
        setModalError("❌ Tên đăng nhập hoặc email đã tồn tại!");
      } else {
        setModalError("❌ Thao tác thất bại: " + (e.message || "Lỗi không xác định"));
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setUsers(u => u.filter(x => x.maTaiKhoan !== id));
      showToast("🗑️ Đã xóa tài khoản khỏi database!");
    } catch (e) {
      setError("❌ Xóa thất bại: " + (e.message || "Lỗi không xác định"));
    } finally { setConfirm(null); }
  };

  const resetLogs = async () => {
    setLogUser(null); setLoading(true); setError("");
    try {
      const l = await getAllLogs();
      setLogs(typeof l === "string" ? [] : (Array.isArray(l) ? l : []));
    } catch { setError("❌ Không tải được nhật ký."); setLogs([]); }
    finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u => {
    const rOk = roleF === "all" || u.vaiTro === Number(roleF);
    const sOk = u.hoTen?.toLowerCase().includes(search.toLowerCase())
             || u.tenDangNhap?.toLowerCase().includes(search.toLowerCase())
             || u.email?.toLowerCase().includes(search.toLowerCase());
    return rOk && sOk;
  });
  const filteredLogs = logs.filter(l =>
    l.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
    l.hanhDong?.toLowerCase().includes(search.toLowerCase())
  );

  const admins = users.filter(u => u.vaiTro === 0).length;
  const gvs    = users.filter(u => u.vaiTro === 1).length;
  const svs    = users.filter(u => u.vaiTro === 2).length;
  const viPham = logs.filter(l => l.hanhDong?.includes("DETECTED")).length;

  if (loading) return <Loader />;

  return (
    <div style={L.page}>
      {toast && <div style={L.toast}>{toast}</div>}

      <Sidebar
        title="ExamOnline" titleColor="#993C1D"
        items={[{id:"users",icon:"👥",label:"Quản lý tài khoản"},{id:"logs",icon:"📋",label:"Nhật ký hệ thống"}]}
        active={section}
        onItemClick={id => { setSection(id); if(id==="logs") resetLogs(); setSearch(""); setError(""); }}
        hoTen={hoTen} roleLabel="⚙️ Quản trị viên"
        avatarGradient="linear-gradient(135deg,#D85A30,#993C1D)"
        onLogout={onLogout} bgColor="#FFF5F0" borderColor="#FAECE7"
      />

      <main style={L.main}>
        <div style={L.header}>
          <div>
            <div style={{...L.greeting,color:"#993C1D"}}>
              {section==="users"?"👥 Quản lý tài khoản":"📋 Nhật ký hệ thống"}
            </div>
            <div style={L.sub}>{logUser?`Log của: ${logUser.hoTen}`:"Tổng quan hệ thống"}</div>
          </div>
          {section==="users" && (
            <button style={L.btnAdd} onClick={()=>{setModal("add");setError("");}}>➕ Thêm tài khoản</button>
          )}
        </div>

        {error && (
          <div style={L.errorBanner}>
            {error}
            <button onClick={()=>setError("")} style={L.errorClose}>✕</button>
          </div>
        )}

        <div style={L.statRow}>
          {section==="users" ? <>
            <StatCard icon="👥" value={users.length} label="Tổng tài khoản" color="purple"/>
            <StatCard icon="⚙️" value={admins}       label="Admin"          color="coral" />
            <StatCard icon="👨‍🏫" value={gvs}          label="Giảng viên"    color="teal"  />
            <StatCard icon="👨‍🎓" value={svs}          label="Sinh viên"     color="amber" />
          </> : <>
            <StatCard icon="📋" value={logs.length}  label="Tổng log"   color="purple"/>
            <StatCard icon="⚠️" value={viPham}       label="Vi phạm"    color="coral" />
            <StatCard icon="🔑" value={logs.filter(l=>l.hanhDong==="LOGIN").length} label="Đăng nhập" color="teal"/>
            <StatCard icon="✅" value={logs.filter(l=>l.hanhDong?.includes("SUBMIT")).length} label="Nộp bài" color="amber"/>
          </>}
        </div>

        <div style={L.toolbar}>
          <div style={L.tabs}>
            {section==="users" ? (
              [{v:"all",l:"Tất cả"},{v:"0",l:"⚙️ Admin"},{v:"1",l:"👨‍🏫 GV"},{v:"2",l:"👨‍🎓 SV"}].map(({v,l})=>(
                <TabBtn key={v} active={roleF===v} accent="#D85A30" border="#FAECE7" onClick={()=>setRoleF(v)}>{l}</TabBtn>
              ))
            ) : logUser && (
              <button style={L.backLog} onClick={resetLogs}>← Tất cả log</button>
            )}
          </div>
          <input style={{...L.search,borderColor:"#FAECE7"}}
            placeholder={section==="users"?"🔍 Tìm tài khoản...":"🔍 Tìm log..."}
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {section==="users" && (
          <div style={{...L.tableWrap,borderColor:"#FAECE7"}}>
            <table style={L.table}>
              <thead><tr style={{background:"#FFF5F0"}}>
                {["ID","Họ tên","Tên đăng nhập","Email","SĐT","Vai trò","Ngày tạo","Thao tác"].map(h=>(
                  <th key={h} style={L.th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredUsers.length===0 && (
                  <tr><td colSpan={8} style={{textAlign:"center",padding:32,color:"#B4B2A9",fontWeight:700}}>
                    {users.length===0?"📭 Database chưa có tài khoản nào":"😔 Không tìm thấy"}
                  </td></tr>
                )}
                {filteredUsers.map(u=>{
                  const r=ROLE_MAP[u.vaiTro]||ROLE_MAP[2];
                  return (
                    <tr key={u.maTaiKhoan} style={L.tr}>
                      <td style={L.td}><span style={L.idChip}>#{u.maTaiKhoan}</span></td>
                      <td style={L.td}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:nameToGradient(u.hoTen),
                            display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700,flexShrink:0}}>
                            {u.hoTen?.charAt(0)}
                          </div>
                          <span style={{fontWeight:700,color:"#2C2C2A"}}>{u.hoTen}</span>
                        </div>
                      </td>
                      <td style={L.td}><code style={L.code}>{u.tenDangNhap}</code></td>
                      <td style={{...L.td,fontSize:12,color:"#888780"}}>{u.email}</td>
                      <td style={{...L.td,fontSize:12,color:"#888780"}}>{u.soDienThoai}</td>
                      <td style={L.td}><span style={{background:r.bg,color:r.color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{r.icon} {r.label}</span></td>
                      <td style={{...L.td,fontSize:12,color:"#888780"}}>{u.ngayTao?.slice(0,10)}</td>
                      <td style={L.td}>
                        <div style={{display:"flex",gap:6}}>
                          <ABtn color="edit" onClick={()=>{setModal(u);setError("");}}>✏️ Sửa</ABtn>
                          <ABtn color="log"  onClick={()=>viewUserLog(u)}>📋 Log</ABtn>
                          <ABtn color="del"  onClick={()=>setConfirm(u.maTaiKhoan)}>🗑️</ABtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {section==="logs" && (
          <div style={{...L.tableWrap,borderColor:"#FAECE7"}}>
            <table style={L.table}>
              <thead><tr style={{background:"#FFF5F0"}}>
                {["#","Người dùng","Hành động","Thời gian","IP"].map(h=>(
                  <th key={h} style={L.th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredLogs.length===0 && (
                  <tr><td colSpan={5} style={{textAlign:"center",padding:32,color:"#B4B2A9",fontWeight:700}}>
                    📭 Chưa có nhật ký nào
                  </td></tr>
                )}
                {filteredLogs.map(log=>{
                  const ls=getLogStyle(log.hanhDong||"");
                  return (
                    <tr key={log.maLog} style={L.tr}>
                      <td style={L.td}><span style={L.idChip}>#{log.maLog}</span></td>
                      <td style={{...L.td,fontWeight:700,color:"#2C2C2A"}}>{log.hoTen||`User #${log.maTaiKhoan}`}</td>
                      <td style={L.td}>
                        <span style={{background:ls.bg,color:ls.color,borderRadius:10,padding:"3px 10px",fontSize:12,fontWeight:700,display:"inline-flex",gap:4,alignItems:"center"}}>
                          {ls.icon} {log.hanhDong}
                        </span>
                      </td>
                      <td style={{...L.td,fontSize:12,color:"#888780"}}>{log.thoiGian}</td>
                      <td style={L.td}><code style={L.code}>{log.diaChiIP}</code></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && (
        <UserModal
          user={modal==="add"?null:modal}
          onClose={()=>{setModal(null);setError("");}}
          onSave={handleSave}
        />
      )}
      {confirm && (
        <ConfirmDialog
          msg="Xác nhận xoá tài khoản này? Sẽ bị xóa vĩnh viễn khỏi database!"
          onOk={()=>handleDelete(confirm)}
          onCancel={()=>setConfirm(null)}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onSave }) {
  const [form,   setForm]   = useState(user||{hoTen:"",tenDangNhap:"",email:"",soDienThoai:"",matKhau:"",vaiTro:2});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));setModalError("");};
  const isEdit=!!user;

  const handleSave=()=>{
    const errs=validateUserForm(form,!isEdit);
    if(Object.keys(errs).length){setErrors(errs);return;}
    onSave(form,isEdit,setModalError,setSaving);
  };

  return (
    <Modal title={isEdit?"✏️ Sửa tài khoản":"➕ Thêm tài khoản"} titleColor="#993C1D" onClose={onClose}>
      {modalError && (
        <div style={{background:"#FCEBEB",border:"1px solid #F09595",borderRadius:10,
          padding:"10px 14px",fontSize:13,fontWeight:700,color:"#A32D2D",marginBottom:14}}>
          {modalError}
        </div>
      )}
      {[
        {k:"hoTen",l:"Họ tên",ph:"Nhập họ tên..."},
        {k:"tenDangNhap",l:"Tên đăng nhập",ph:"Nhập tên đăng nhập..."},
        ...(!isEdit?[{k:"matKhau",l:"Mật khẩu",ph:"Nhập mật khẩu...",type:"password"}]:[]),
        {k:"email",l:"Email",ph:"email@vimaru.edu.vn",type:"email"},
        {k:"soDienThoai",l:"Số điện thoại",ph:"09xx..."},
      ].map(({k,l,ph,type="text"})=>(
        <FF key={k} label={l} error={errors[k]}>
          <input style={INP} type={type} value={form[k]||""} placeholder={ph} onChange={e=>set(k,e.target.value)} />
        </FF>
      ))}
      <FF label="Vai trò">
        <select style={INP} value={form.vaiTro} onChange={e=>set("vaiTro",Number(e.target.value))}>
          <option value={0}>⚙️ Admin</option>
          <option value={1}>👨‍🏫 Giảng viên</option>
          <option value={2}>👨‍🎓 Sinh viên</option>
        </select>
      </FF>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
        <button style={BTN.cancel} onClick={onClose} disabled={saving}>Huỷ</button>
        <button style={{...BTN.save,background:"linear-gradient(135deg,#D85A30,#993C1D)",opacity:saving?0.7:1}}
          onClick={handleSave} disabled={saving}>
          {saving?"Đang lưu vào DB...":(isEdit?"Cập nhật ✓":"Tạo tài khoản ✓")}
        </button>
      </div>
    </Modal>
  );
}

function FF({label,error,children}){
  return <div style={{marginBottom:14}}>
    <label style={{fontSize:12,fontWeight:700,color:"#444441",display:"block",marginBottom:5}}>{label}</label>
    {children}
    {error&&<div style={{fontSize:11,color:"#E24B4A",fontWeight:600,marginTop:3}}>{error}</div>}
  </div>;
}
function TabBtn({active,onClick,accent="#7F77DD",border="#EEEDFE",children}){
  return <button style={{background:active?accent:"white",color:active?"white":"#888780",
    border:`2px solid ${active?accent:border}`,borderRadius:12,padding:"7px 14px",
    fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={onClick}>{children}</button>;
}
function ABtn({color,onClick,children}){
  const c={edit:{bg:"#EEEDFE",t:"#534AB7"},log:{bg:"#E1F5EE",t:"#085041"},del:{bg:"#FCEBEB",t:"#A32D2D"}}[color]||{bg:"#EEEDFE",t:"#534AB7"};
  return <button style={{background:c.bg,color:c.t,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={onClick}>{children}</button>;
}
function Loader(){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'Nunito',sans-serif",fontSize:18,color:"#7F77DD"}}>⏳ Đang tải từ database...</div>;
}

const INP={width:"100%",border:"2px solid #FAECE7",borderRadius:10,padding:"9px 12px",fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:600,outline:"none",background:"#FFF5F0",boxSizing:"border-box"};
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
  search:     {background:"white",border:"2px solid #EEEDFE",borderRadius:12,padding:"8px 14px",fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:600,outline:"none",width:200},
  backLog:    {background:"#FFF5F0",border:"2px solid #FAECE7",borderRadius:12,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#993C1D"},
  tableWrap:  {background:"white",borderRadius:16,overflow:"auto",boxShadow:"0 2px 12px rgba(216,90,48,0.08)",border:"1px solid #FAECE7"},
  table:      {width:"100%",borderCollapse:"collapse",minWidth:700},
  th:         {padding:"12px 16px",fontSize:11,fontWeight:700,color:"#888780",textAlign:"left",borderBottom:"1px solid #FAECE7",textTransform:"uppercase",letterSpacing:"0.5px"},
  tr:         {borderBottom:"1px solid #FFF5F0"},
  td:         {padding:"11px 16px",fontSize:13,color:"#444441"},
  idChip:     {background:"#F1EFE8",padding:"2px 8px",borderRadius:6,fontSize:12,fontWeight:700,color:"#888780"},
  code:       {background:"#F1EFE8",padding:"2px 6px",borderRadius:4,fontSize:12,color:"#444441"},
  errorBanner:{background:"#FCEBEB",border:"1px solid #F09595",borderRadius:12,padding:"12px 16px",
    fontSize:13,fontWeight:700,color:"#A32D2D",marginBottom:16,display:"flex",
    justifyContent:"space-between",alignItems:"center"},
  errorClose: {background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#A32D2D",fontWeight:700,padding:0},
  toast:      {position:"fixed",top:20,right:24,background:"#065C49",color:"white",
    borderRadius:12,padding:"12px 20px",fontSize:14,fontWeight:700,
    boxShadow:"0 4px 20px rgba(0,0,0,0.2)",zIndex:9999},
};