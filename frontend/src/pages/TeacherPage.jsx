// ============================================================
//  pages/TeacherPage.jsx  —  Chủ đề: Xanh ngọc + Vàng
// ============================================================
import { useState, useEffect } from "react";
import { getDashboardTeacher, createBaiThi, updateBaiThi, deleteBaiThi } from "../services/api";
import { getHoTen } from "../services/api";
import { MOCK_DASHBOARD_TEACHER, OPTIONS_LOP, OPTIONS_MON_THI, OPTIONS_CA_THI, OPTIONS_NGAN_HANG } from "../utils/mockData";
import { validateBaiThiForm, nameToGradient } from "../utils/helpers";
import Modal         from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatCard      from "../components/StatCard";

// ── Theme màu xanh ngọc + vàng ───────────────────────────
const T = {
  primary:   "#0F8A6E",
  primary2:  "#065C49",
  light:     "#E6F7F3",
  accent:    "#D4930A",
  accentBg:  "#FDF3D8",
  bg:        "#F0FBF8",
  sidebar:   "#065C49",
  sideText:  "rgba(255,255,255,0.75)",
  sideActive:"rgba(255,255,255,0.15)",
  border:    "#B2E0D4",
};

export default function TeacherPage({ onLogout, onViewAnalytics }) {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("exams");
  const [tab,     setTab]     = useState("valid");
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const hoTen = getHoTen() || "Giảng viên";

  useEffect(() => {
    getDashboardTeacher()
      .then(d => setExams([...(d.examsValid||[]),...(d.examsExpired||[])]))
      .catch(() => setExams([...MOCK_DASHBOARD_TEACHER.examsValid,...MOCK_DASHBOARD_TEACHER.examsExpired]))
      .finally(() => setLoading(false));
  }, []);

  const valid   = exams.filter(e => e.conHan);
  const expired = exams.filter(e => !e.conHan);
  const list    = (tab==="valid"?valid:expired)
    .filter(e => e.tenBaiThi?.toLowerCase().includes(search.toLowerCase())
              || e.tenMonThi?.toLowerCase().includes(search.toLowerCase()));

  const totalSV  = exams.reduce((s,e)=>s+(e.soThiSinh||0),0);
  const avgScore = (() => {
    const w = exams.filter(e=>e.diemTB!=null);
    return w.length ? (w.reduce((s,e)=>s+e.diemTB,0)/w.length).toFixed(1) : "—";
  })();

  const handleSave = async (form, isEdit) => {
    try {
      const saved = isEdit ? await updateBaiThi(form.maBaiThi,form) : await createBaiThi(form);
      setExams(prev => {
        const idx=prev.findIndex(e=>e.maBaiThi===saved.maBaiThi);
        if(idx>=0){const n=[...prev];n[idx]=saved;return n;}
        return [saved,...prev];
      });
    } catch {
      const mock={...form,maBaiThi:form.maBaiThi||Date.now(),conHan:true,soThiSinh:0};
      setExams(prev=>{const idx=prev.findIndex(e=>e.maBaiThi===mock.maBaiThi);if(idx>=0){const n=[...prev];n[idx]=mock;return n;}return[mock,...prev];});
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    try { await deleteBaiThi(id); } catch {}
    setExams(e=>e.filter(x=>x.maBaiThi!==id));
    setConfirm(null);
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'Nunito',sans-serif",fontSize:18,color:T.primary}}>⏳ Đang tải...</div>;

  return (
    <div style={{display:"flex",minHeight:"100vh",background:T.bg,fontFamily:"'Nunito',sans-serif"}}>

      {/* ── Sidebar xanh đậm ── */}
      <aside style={{width:230,flexShrink:0,background:T.sidebar,padding:"28px 16px",
        display:"flex",flexDirection:"column",justifyContent:"space-between",
        position:"sticky",top:0,height:"100vh"}}>
        <div>
          <div style={{fontFamily:"'Baloo 2',sans-serif",fontSize:20,fontWeight:800,
            color:"white",marginBottom:24,display:"flex",alignItems:"center",gap:8}}>
            🎓 ExamOnline
          </div>
          {/* Avatar */}
          <div style={{display:"flex",alignItems:"center",gap:10,
            background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"10px 12px",marginBottom:16}}>
            <div style={{width:38,height:38,borderRadius:"50%",
              background:"linear-gradient(135deg,#F5A623,#D4930A)",
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"white",fontWeight:800,fontSize:16,flexShrink:0}}>
              {hoTen.charAt(0)}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"white"}}>{hoTen}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontWeight:600}}>👨‍🏫 Giảng viên</div>
            </div>
          </div>

          {/* Menu */}
          {[
            {id:"exams",icon:"📋",label:"Quản lý bài thi"},
            {id:"stats",icon:"📊",label:"Thống kê"},
          ].map(m=>(
            <div key={m.id}
              style={{padding:"10px 14px",borderRadius:12,cursor:"pointer",
                fontSize:13,fontWeight:600,marginBottom:4,
                background: section===m.id?"rgba(255,255,255,0.2)":"transparent",
                color: section===m.id?"white":T.sideText,
                transition:"all 0.15s"}}
              onClick={()=>setSection(m.id)}>
              {m.icon} {m.label}
            </div>
          ))}
        </div>
        <button style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",
          borderRadius:12,padding:10,fontSize:13,fontWeight:700,color:"white",cursor:"pointer"}}>
          🚪 Đăng xuất
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={{flex:1,padding:"28px 32px",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div>
            <div style={{fontFamily:"'Baloo 2',sans-serif",fontSize:26,fontWeight:800,color:T.primary2}}>
              📋 Quản lý bài thi
            </div>
            <div style={{fontSize:13,color:"#888780",fontWeight:600,marginTop:2}}>
              Xin chào, <strong>{hoTen}</strong>! Chúc bạn một ngày làm việc hiệu quả 🌿
            </div>
          </div>
          <button style={{background:`linear-gradient(135deg,${T.primary},${T.primary2})`,
            color:"white",border:"none",borderRadius:14,padding:"10px 22px",
            fontSize:13,fontWeight:700,cursor:"pointer",
            boxShadow:`0 4px 14px rgba(15,138,110,0.35)`}}
            onClick={()=>setModal("add")}>
            ➕ Thêm bài thi
          </button>
        </div>

        {/* Stats */}
        <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
          <StatCardT icon="📝" value={exams.length} label="Tổng bài thi"   bg="#E6F7F3" val={T.primary2} />
          <StatCardT icon="🟢" value={valid.length}  label="Đang mở"        bg="#FDF3D8" val="#8B6000"   />
          <StatCardT icon="👥" value={totalSV}        label="Tổng thí sinh"  bg="#E6F7F3" val={T.primary2} />
          <StatCardT icon="⭐" value={avgScore}        label="Điểm TB chung" bg="#FDF3D8" val="#8B6000"   />
        </div>

        {/* Toolbar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:8}}>
            {["valid","expired"].map(v=>(
              <button key={v}
                style={{background: tab===v?T.primary:"white",
                  color: tab===v?"white":"#888780",
                  border:`2px solid ${tab===v?T.primary:T.border}`,
                  borderRadius:12,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                <span onClick={()=>setTab(v)}>
                  {v==="valid"?`🟢 Đang mở (${valid.length})`:`🔴 Đã kết thúc (${expired.length})`}
                </span>
              </button>
            ))}
          </div>
          <input style={{background:"white",border:`2px solid ${T.border}`,borderRadius:12,
            padding:"8px 14px",fontSize:13,fontFamily:"'Nunito',sans-serif",
            fontWeight:600,outline:"none",width:200}}
            placeholder="🔍 Tìm kiếm..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div style={{background:"white",borderRadius:16,overflow:"hidden",
          boxShadow:"0 2px 12px rgba(15,138,110,0.08)",border:`1px solid ${T.border}`}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F0FBF8"}}>
              {["Tên bài thi","Môn","Thời lượng","Thí sinh","Điểm TB","Trạng thái","Thao tác"].map(h=>(
                <th key={h} style={{padding:"12px 16px",fontSize:11,fontWeight:700,
                  color:"#888780",textAlign:"left",borderBottom:`1px solid ${T.border}`,
                  textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {list.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:32,color:"#B4B2A9",fontWeight:700}}>😔 Không có bài thi nào</td></tr>}
              {list.map(exam=>(
                <tr key={exam.maBaiThi} style={{borderBottom:`1px solid #F0FBF8`}}>
                  <td style={{padding:"12px 16px",fontSize:13,fontWeight:700,color:"#2C2C2A"}}>{exam.tenBaiThi}</td>
                  <td style={{padding:"12px 16px"}}>
                    <span style={{background:T.accentBg,color:T.accent,borderRadius:8,padding:"2px 8px",fontSize:12,fontWeight:700}}>{exam.tenMonThi||"—"}</span>
                  </td>
                  <td style={{padding:"12px 16px",fontSize:13,color:"#444441"}}>⏱️ {exam.thoiLuong} ph</td>
                  <td style={{padding:"12px 16px",fontSize:13,color:"#444441"}}>👥 {exam.soThiSinh??0}</td>
                  <td style={{padding:"12px 16px"}}>
                    {exam.diemTB!=null
                      ?<strong style={{color:T.primary}}>{exam.diemTB}</strong>
                      :<span style={{color:"#B4B2A9"}}>—</span>}
                  </td>
                  <td style={{padding:"12px 16px"}}>
                    {exam.conHan
                      ?<span style={{background:"#E6F7F3",color:T.primary2,border:`1px solid ${T.border}`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>🟢 Đang mở</span>
                      :<span style={{background:"#FCEBEB",color:"#A32D2D",border:"1px solid #F09595",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>🔴 Hết hạn</span>}
                  </td>
                  <td style={{padding:"12px 16px"}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <button style={{background:T.light,color:T.primary2,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}
                        onClick={()=>setModal(exam)}>✏️ Sửa</button>
                      <button style={{background:T.accentBg,color:T.accent,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}
                        onClick={()=>onViewAnalytics&&onViewAnalytics(exam)}>📊 TK</button>
                      <button style={{background:"#FCEBEB",color:"#A32D2D",border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}
                        onClick={()=>setConfirm(exam.maBaiThi)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modal && <BaiThiModal exam={modal==="add"?null:modal} onClose={()=>setModal(null)} onSave={handleSave} />}
      {confirm && <ConfirmDialog msg="Xác nhận xoá bài thi này?" onOk={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)} />}
    </div>
  );
}

function StatCardT({icon,value,label,bg,val}) {
  return (
    <div style={{background:bg,borderRadius:16,padding:"16px 20px",flex:1,minWidth:110}}>
      <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
      <div style={{fontSize:24,fontWeight:800,color:val,fontFamily:"'Baloo 2',sans-serif"}}>{value}</div>
      <div style={{fontSize:12,color:"#888780",fontWeight:600}}>{label}</div>
    </div>
  );
}

function BaiThiModal({exam,onClose,onSave}) {
  const [form,setForm]=useState(exam||{tenBaiThi:"",tenMonThi:"",thoiLuong:45,maLop:"",maCaThi:"",maNganHang:""});
  const [errors,setErrors]=useState({});
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));};
  const isEdit=!!exam;
  const INP={width:"100%",border:`2px solid #B2E0D4`,borderRadius:10,padding:"9px 12px",
    fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:600,outline:"none",
    background:"#F0FBF8",boxSizing:"border-box"};
  const handleSave=()=>{
    const errs=validateBaiThiForm(form);
    if(Object.keys(errs).length){setErrors(errs);return;}
    onSave(form,isEdit);
  };
  return (
    <Modal title={isEdit?"✏️ Sửa bài thi":"➕ Thêm bài thi"} titleColor={T.primary2} onClose={onClose}>
      {[
        {k:"tenBaiThi",l:"Tên bài thi",el:<input style={INP} value={form.tenBaiThi} onChange={e=>set("tenBaiThi",e.target.value)} placeholder="Nhập tên bài thi..."/>},
        {k:"tenMonThi",l:"Môn thi",el:<select style={INP} value={form.tenMonThi} onChange={e=>set("tenMonThi",e.target.value)}><option value="">-- Chọn môn --</option>{OPTIONS_MON_THI.map(o=><option key={o}>{o}</option>)}</select>},
        {k:"maLop",l:"Lớp",el:<select style={INP} value={form.maLop} onChange={e=>set("maLop",e.target.value)}><option value="">-- Chọn lớp --</option>{OPTIONS_LOP.map(o=><option key={o}>{o}</option>)}</select>},
        {k:"maCaThi",l:"Ca thi",el:<select style={INP} value={form.maCaThi} onChange={e=>set("maCaThi",e.target.value)}><option value="">-- Chọn ca --</option>{OPTIONS_CA_THI.map(o=><option key={o}>{o}</option>)}</select>},
        {k:"maNganHang",l:"Ngân hàng câu hỏi",el:<select style={INP} value={form.maNganHang} onChange={e=>set("maNganHang",e.target.value)}><option value="">-- Chọn ngân hàng --</option>{OPTIONS_NGAN_HANG.map(o=><option key={o}>{o}</option>)}</select>},
        {k:"thoiLuong",l:"Thời lượng (phút)",el:<input style={INP} type="number" min="5" max="180" value={form.thoiLuong} onChange={e=>set("thoiLuong",Number(e.target.value))}/>},
      ].map(({k,l,el})=>(
        <div key={k} style={{marginBottom:14}}>
          <label style={{fontSize:12,fontWeight:700,color:"#444441",display:"block",marginBottom:5}}>{l}</label>
          {el}
          {errors[k]&&<div style={{fontSize:11,color:"#E24B4A",fontWeight:600,marginTop:3}}>{errors[k]}</div>}
        </div>
      ))}
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
        <button style={{background:"white",border:"2px solid #B2E0D4",borderRadius:12,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#888780"}} onClick={onClose}>Huỷ</button>
        <button style={{background:`linear-gradient(135deg,${T.primary},${T.primary2})`,color:"white",border:"none",borderRadius:12,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}} onClick={handleSave}>{isEdit?"Cập nhật ✓":"Thêm ✓"}</button>
      </div>
    </Modal>
  );
}