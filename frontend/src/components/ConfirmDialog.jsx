// ============================================================
//  components/ConfirmDialog.jsx
//  Confirm trước khi xoá / cập nhật dữ liệu quan trọng
// ============================================================
export default function ConfirmDialog({
  msg       = "Bạn có chắc chắn?",
  subMsg    = "Hành động này không thể hoàn tác!",
  okLabel   = "Xác nhận",
  okColor   = "linear-gradient(135deg,#E24B4A,#A32D2D)",
  onOk,
  onCancel,
}) {
  return (
    <div style={S.overlay} onClick={e => { if(e.target===e.currentTarget) onCancel(); }}>
      <div style={S.card}>
        <div style={{ fontSize:44, marginBottom:12 }}>⚠️</div>
        <div style={S.msg}>{msg}</div>
        <div style={S.sub}>{subMsg}</div>
        <div style={S.btns}>
          <button style={S.btnCancel} onClick={onCancel}>Không</button>
          <button style={{ ...S.btnOk, background:okColor }} onClick={onOk}>
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay:   { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
               display:"flex", alignItems:"center", justifyContent:"center",
               zIndex:1100, padding:20 },
  card:      { background:"white", borderRadius:24, padding:32,
               maxWidth:340, width:"100%", textAlign:"center",
               boxShadow:"0 20px 60px rgba(0,0,0,0.15)" },
  msg:       { fontSize:15, fontWeight:700, color:"#2C2C2A", marginBottom:6 },
  sub:       { fontSize:13, color:"#888780", marginBottom:24 },
  btns:      { display:"flex", gap:10, justifyContent:"center" },
  btnCancel: { background:"white", border:"2px solid #EEEDFE", borderRadius:20,
               padding:"10px 20px", fontFamily:"'Nunito',sans-serif",
               fontWeight:700, fontSize:14, cursor:"pointer", color:"#888780" },
  btnOk:     { color:"white", border:"none", borderRadius:20,
               padding:"10px 24px", fontFamily:"'Nunito',sans-serif",
               fontWeight:700, fontSize:14, cursor:"pointer" },
};
