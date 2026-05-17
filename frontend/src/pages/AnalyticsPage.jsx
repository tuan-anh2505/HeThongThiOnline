// ============================================================
//  pages/AnalyticsPage.jsx
// ============================================================
import { useState, useEffect } from "react";
import { getAnalytics, exportCSV } from "../services/api";
import { MOCK_ANALYTICS } from "../utils/mockData";
import { diemColor } from "../utils/helpers";
import StatCard from "../components/StatCard";

export default function AnalyticsPage({ exam, onBack }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState("diem_desc");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    getAnalytics(exam?.maBaiThi || 1)
      .then(setData)
      .catch(()=>setData(MOCK_ANALYTICS))
      .finally(()=>setLoading(false));
  }, []);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",
      fontFamily:"'Nunito',sans-serif",fontSize:18,color:"#7F77DD"}}>⏳ Đang tải thống kê...</div>
  );

  const d = data;
  const pass = d.tiLeQua ?? 80;
  const fail = 100 - pass;

  const sorted = [...(d.danhSachThiSinh||[])]
    .filter(s => s.hoTen.toLowerCase().includes(search.toLowerCase()) || s.maSV?.includes(search))
    .sort((a,b) => {
      if(sort==="diem_desc") return b.diem-a.diem;
      if(sort==="diem_asc")  return a.diem-b.diem;
      if(sort==="ten")       return a.hoTen.localeCompare(b.hoTen);
      if(sort==="vipham")    return b.soViPham-a.soViPham;
      return 0;
    });

  const top3 = [...(d.danhSachThiSinh||[])].sort((a,b)=>b.diem-a.diem).slice(0,3);

  return (
    <div style={S.page}>
      {/* Topbar */}
      <div style={S.topbar}>
        <button style={S.backBtn} onClick={onBack}>← Quay lại</button>
        <div style={{flex:1}}>
          <div style={S.topTitle}>📊 {d.tenBaiThi}</div>
          <div style={S.topSub}>📚 {d.tenMonThi} · {d.soThiSinh} thí sinh</div>
        </div>
        <button style={S.exportBtn} onClick={()=>exportCSV(exam?.maBaiThi||1)}>⬇️ Xuất CSV</button>
      </div>

      <div style={S.body}>
        {/* Stats */}
        <div style={S.statRow}>
          <StatCard icon="👥" label="Tổng thí sinh"   value={d.soThiSinh}                    color="purple"/>
          <StatCard icon="⭐" label="Điểm trung bình" value={d.diemTrungBinh?.toFixed(1)}    color="teal"  />
          <StatCard icon="🏆" label="Điểm cao nhất"   value={d.diemCaoNhat}                  color="amber" />
          <StatCard icon="📉" label="Điểm thấp nhất"  value={d.diemThapNhat}                 color="red"   />
          <StatCard icon="✅" label="Tỉ lệ qua môn"   value={`${pass.toFixed(1)}%`}          color="teal"  />
        </div>

        {/* Charts row */}
        <div style={S.chartRow}>
          {/* Donut */}
          <div style={S.chartCard}>
            <div style={S.cardTitle}>🎯 Tỉ lệ qua môn</div>
            <div style={{display:"flex",alignItems:"center",gap:24,justifyContent:"center",padding:"12px 0"}}>
              <DonutChart pass={pass} fail={fail} />
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <LegendItem color="#1D9E75" label="Qua môn (≥5)" value={Math.round(pass*d.soThiSinh/100)} />
                <LegendItem color="#E24B4A" label="Rớt môn (<5)" value={Math.round(fail*d.soThiSinh/100)} />
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{...S.chartCard,flex:2}}>
            <div style={S.cardTitle}>📊 Phân phối điểm</div>
            <BarChart data={d.phanPhoDiem||[]} />
          </div>

          {/* Top 3 */}
          <div style={S.chartCard}>
            <div style={S.cardTitle}>🏅 Top 3 điểm cao</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
              {top3.map((s,i)=>{
                const medals=["🥇","🥈","🥉"];
                const bgs=["#FAEEDA","#F1EFE8","#FAECE7"];
                return (
                  <div key={s.maSV} style={{background:bgs[i],borderRadius:12,padding:"10px 14px",
                    display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:20}}>{medals[i]}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#2C2C2A"}}>{s.hoTen}</div>
                      <div style={{fontSize:11,color:"#888780"}}>{s.maSV}</div>
                    </div>
                    <div style={{fontFamily:"'Baloo 2',sans-serif",fontSize:20,fontWeight:800,color:diemColor(s.diem)}}>{s.diem}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Score table */}
        <div style={S.tableCard}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <div style={S.cardTitle}>📋 Danh sách điểm ({sorted.length} thí sinh)</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input style={S.search} placeholder="🔍 Tìm thí sinh..." value={search} onChange={e=>setSearch(e.target.value)} />
              <select style={S.select} value={sort} onChange={e=>setSort(e.target.value)}>
                <option value="diem_desc">Điểm cao → thấp</option>
                <option value="diem_asc">Điểm thấp → cao</option>
                <option value="ten">Theo tên A-Z</option>
                <option value="vipham">Vi phạm nhiều nhất</option>
              </select>
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
              <thead><tr style={{background:"#F8F7FF"}}>
                {["#","Mã SV","Họ tên","Nộp lúc","Vi phạm","Điểm","Kết quả"].map(h=>(
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {sorted.map((sv,i)=>(
                  <tr key={sv.maSV} style={{borderBottom:"1px solid #F8F7FF",background:i%2===0?"white":"#FAFAFA"}}>
                    <td style={S.td}><span style={{background:"#EEEDFE",color:"#534AB7",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700}}>{i+1}</span></td>
                    <td style={S.td}><code style={{background:"#F1EFE8",padding:"2px 6px",borderRadius:4,fontSize:12}}>{sv.maSV}</code></td>
                    <td style={{...S.td,fontWeight:700,color:"#2C2C2A"}}>{i===0?"🏆 ":""}{sv.hoTen}</td>
                    <td style={{...S.td,fontSize:12,color:"#888780"}}>🕐 {sv.thoiGianNop}</td>
                    <td style={S.td}>{sv.soViPham>0
                      ?<span style={{background:"#FAEEDA",color:"#633806",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>⚠️ {sv.soViPham}</span>
                      :<span style={{color:"#1D9E75",fontWeight:700,fontSize:12}}>✓ Không</span>}
                    </td>
                    <td style={S.td}>
                      <span style={{fontFamily:"'Baloo 2',sans-serif",fontSize:18,fontWeight:800,color:diemColor(sv.diem)}}>{sv.diem}</span>
                      <span style={{fontSize:11,color:"#B4B2A9"}}>/10</span>
                    </td>
                    <td style={S.td}>{sv.diem>=5
                      ?<span style={{background:"#E1F5EE",color:"#085041",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>✅ Đạt</span>
                      :<span style={{background:"#FCEBEB",color:"#A32D2D",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>❌ Rớt</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SVG Charts ────────────────────────────────────────────
function DonutChart({ pass, fail }) {
  const r=54,cx=70,cy=70,sw=18,circ=2*Math.PI*r;
  const pd=(pass/100)*circ, fd=(fail/100)*circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FCEBEB" strokeWidth={sw}
        strokeDasharray={`${fd} ${circ-fd}`} strokeDashoffset={-pd}
        transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1D9E75" strokeWidth={sw}
        strokeDasharray={`${pd} ${circ-pd}`}
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#085041">{pass.toFixed(1)}%</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#888780">Qua môn</text>
    </svg>
  );
}
function BarChart({ data }) {
  const max=Math.max(...data.map(d=>d.soLuong),1);
  const W=340,H=140,pad=30,bw=28,gap=8;
  const colors={"9–10":"#1D9E75","8–9":"#7F77DD","7–8":"#AFA9EC","6–7":"#FAC775","5–6":"#F0B775"};
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H+30}`} style={{overflow:"visible"}}>
      {[0,0.25,0.5,0.75,1].map((v,i)=>{
        const y=pad+(1-v)*(H-pad);
        return <g key={i}>
          <line x1={pad} y1={y} x2={W-10} y2={y} stroke="#EEEDFE" strokeWidth="1"/>
          <text x={pad-4} y={y+4} textAnchor="end" fontSize="9" fill="#B4B2A9">{Math.round(v*max)}</text>
        </g>;
      })}
      {data.map((d,i)=>{
        const x=pad+i*(bw+gap)+4;
        const bH=d.soLuong===0?0:((d.soLuong/max)*(H-pad));
        const y=pad+(H-pad)-bH;
        const col=colors[d.khoang]||"#F09595";
        return <g key={i}>
          <rect x={x} y={y} width={bw} height={bH} rx="4" fill={col} opacity="0.9"/>
          {d.soLuong>0&&<text x={x+bw/2} y={y-4} textAnchor="middle" fontSize="10" fontWeight="700" fill={col}>{d.soLuong}</text>}
          <text x={x+bw/2} y={H+pad-6} textAnchor="middle" fontSize="9" fill="#888780">{d.khoang}</text>
        </g>;
      })}
    </svg>
  );
}
function LegendItem({color,label,value}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:14,height:14,borderRadius:3,background:color,flexShrink:0}}/>
      <span style={{fontSize:13,fontWeight:600,color:"#444441",flex:1}}>{label}</span>
      <strong style={{color}}>{value}</strong>
    </div>
  );
}

const S={
  page:     {minHeight:"100vh",background:"#F0EFFE",fontFamily:"'Nunito',sans-serif"},
  topbar:   {background:"white",borderBottom:"2px solid #EEEDFE",padding:"14px 28px",
             display:"flex",alignItems:"center",gap:16,position:"sticky",top:0,zIndex:10},
  backBtn:  {background:"#EEEDFE",border:"none",borderRadius:12,padding:"8px 16px",
             fontSize:13,fontWeight:700,color:"#534AB7",cursor:"pointer"},
  topTitle: {fontFamily:"'Baloo 2',sans-serif",fontSize:18,fontWeight:800,color:"#3C3489"},
  topSub:   {fontSize:12,color:"#888780",fontWeight:600},
  exportBtn:{background:"linear-gradient(135deg,#1D9E75,#085041)",color:"white",border:"none",
             borderRadius:12,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer"},
  body:     {padding:"24px 28px"},
  statRow:  {display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"},
  chartRow: {display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"},
  chartCard:{background:"white",borderRadius:16,padding:"18px 20px",flex:1,minWidth:200,
             boxShadow:"0 2px 12px rgba(127,119,221,0.08)",border:"1px solid #EEEDFE"},
  cardTitle:{fontFamily:"'Baloo 2',sans-serif",fontSize:15,fontWeight:800,color:"#3C3489",marginBottom:4},
  tableCard:{background:"white",borderRadius:16,padding:"20px 24px",
             boxShadow:"0 2px 12px rgba(127,119,221,0.08)",border:"1px solid #EEEDFE"},
  search:   {background:"#F8F7FF",border:"2px solid #EEEDFE",borderRadius:10,padding:"7px 12px",
             fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:600,outline:"none",width:180},
  select:   {background:"#F8F7FF",border:"2px solid #EEEDFE",borderRadius:10,padding:"7px 12px",
             fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:600,outline:"none",cursor:"pointer"},
  th:       {padding:"10px 14px",fontSize:11,fontWeight:700,color:"#888780",textAlign:"left",
             borderBottom:"1px solid #EEEDFE",textTransform:"uppercase",letterSpacing:"0.5px"},
  td:       {padding:"10px 14px",fontSize:13,color:"#444441"},
  red:      {bg:"#FCEBEB",v:"#A32D2D"},
};
