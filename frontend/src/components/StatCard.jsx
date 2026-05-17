// ============================================================
//  components/StatCard.jsx
// ============================================================
const COLORS = {
  purple: { bg:"#EEEDFE", val:"#3C3489" },
  teal:   { bg:"#E1F5EE", val:"#085041" },
  amber:  { bg:"#FAEEDA", val:"#633806" },
  pink:   { bg:"#FBEAF0", val:"#72243E" },
  coral:  { bg:"#FAECE7", val:"#993C1D" },
  red:    { bg:"#FCEBEB", val:"#A32D2D" },
};

export default function StatCard({ icon, label, value, color = "purple" }) {
  const c = COLORS[color] || COLORS.purple;
  return (
    <div style={{ background:c.bg, borderRadius:16, padding:"16px 20px",
      flex:1, minWidth:110 }}>
      <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:24, fontWeight:800, color:c.val,
        fontFamily:"'Baloo 2',sans-serif" }}>{value}</div>
      <div style={{ fontSize:12, color:"#888780", fontWeight:600 }}>{label}</div>
    </div>
  );
}
