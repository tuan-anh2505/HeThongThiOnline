// ============================================================
//  components/Modal.jsx
//  Generic modal wrapper — dùng cho form thêm/sửa
// ============================================================
export default function Modal({
  title,
  titleColor = "#3C3489",
  onClose,
  children,
  maxWidth = 480,
}) {
  return (
    <div style={S.overlay} onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ ...S.card, maxWidth }}>
        <div style={S.head}>
          <span style={{ ...S.title, color:titleColor }}>{title}</span>
          <span style={S.close} onClick={onClose}>✕</span>
        </div>
        {children}
      </div>
    </div>
  );
}

const S = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)",
             display:"flex", alignItems:"center", justifyContent:"center",
             zIndex:1000, padding:20 },
  card:    { background:"white", borderRadius:20, padding:28, width:"100%",
             maxHeight:"90vh", overflowY:"auto",
             boxShadow:"0 20px 60px rgba(0,0,0,0.15)",
             animation:"modalIn 0.2s ease" },
  head:    { display:"flex", justifyContent:"space-between",
             alignItems:"center", marginBottom:20 },
  title:   { fontFamily:"'Baloo 2',sans-serif", fontSize:18, fontWeight:800 },
  close:   { cursor:"pointer", fontSize:20, color:"#888780",
             lineHeight:1, padding:"0 4px" },
};
