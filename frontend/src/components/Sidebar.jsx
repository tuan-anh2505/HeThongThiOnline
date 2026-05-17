import { nameToGradient } from "../utils/helpers";

export default function Sidebar({
  title       = "ExamOnline",
  titleColor  = "#3C3489",
  items       = [],
  active      = "",
  onItemClick,
  hoTen       = "",
  roleLabel   = "",
  avatarGradient,
  onLogout,
  extra,
  bgColor     = "white",
  borderColor = "#EEEDFE",
}) {
  return (
    <aside style={{ ...S.sidebar, background:bgColor, borderColor }}>
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, minHeight:0 }}>
        <div style={{ ...S.logo, color:titleColor }}>🎓 {title}</div>

        <div style={{ ...S.avatarWrap, background: bgColor==="white" ? "#F8F7FF" : `${bgColor}cc` }}>
          <div style={{ ...S.avatar, background: avatarGradient || nameToGradient(hoTen) }}>
            {hoTen?.charAt(0) || "?"}
          </div>
          <div>
            <div style={S.avatarName}>{hoTen || "—"}</div>
            <div style={S.avatarRole}>{roleLabel}</div>
          </div>
        </div>

        {items.map(item => (
          <div key={item.id}
            style={{
              ...S.menuItem,
              ...(active===item.id ? { ...S.menuActive, background:`${titleColor}15`, color:titleColor } : {}),
            }}
            onClick={() => onItemClick && onItemClick(item.id)}>
            {item.icon} {item.label}
          </div>
        ))}

        {extra && <div style={{ marginTop:8 }}>{extra}</div>}
      </div>

      <div style={{ paddingTop:12, flexShrink:0 }}>
        <button style={S.logoutBtn} onClick={onLogout}>🚪 Đăng xuất</button>
      </div>
    </aside>
  );
}

const S = {
  sidebar:    { width:224, flexShrink:0, borderRight:"2px solid", padding:"24px 16px",
               display:"flex", flexDirection:"column",
               position:"sticky", top:0, height:"100vh", boxSizing:"border-box" },
  logo:       { fontFamily:"'Baloo 2',sans-serif", fontSize:18, fontWeight:800,
               marginBottom:16, display:"flex", alignItems:"center", gap:8, flexShrink:0 },
  avatarWrap: { display:"flex", alignItems:"center", gap:10, borderRadius:14,
               padding:"10px 12px", marginBottom:8, flexShrink:0 },
  avatar:     { width:36, height:36, borderRadius:"50%", color:"white",
               display:"flex", alignItems:"center", justifyContent:"center",
               fontWeight:800, fontSize:16, flexShrink:0 },
  avatarName: { fontSize:13, fontWeight:700, color:"#2C2C2A" },
  avatarRole: { fontSize:11, color:"#888780", fontWeight:600 },
  menuItem:   { padding:"9px 12px", borderRadius:10, cursor:"pointer",
               fontSize:13, fontWeight:600, color:"#444441",
               transition:"all 0.15s", marginBottom:2, flexShrink:0 },
  menuActive: { fontWeight:700 },
  logoutBtn:  { background:"#FCEBEB", border:"1px solid #F09595", borderRadius:12,
               padding:10, fontSize:13, fontWeight:700, color:"#A32D2D",
               cursor:"pointer", width:"100%" },
};