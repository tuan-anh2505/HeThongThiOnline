// ============================================================
//  pages/ExamPage.jsx
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";
import { startExam, getQuestions, submitExam, reportViolation } from "../services/api";
import { MOCK_QUESTIONS } from "../utils/mockData";
import { gradeExam, gradeQuestion, formatCountdown, LOAI_CAU_HOI } from "../utils/helpers";

export default function ExamPage({ exam, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});   // { maCauHoi: value }
  const [current,   setCurrent]   = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alert,     setAlert]     = useState({ show:false, msg:"" });
  const [violations,setViols]     = useState(0);
  const [baiLamId,  setBaiLamId]  = useState(null);
  const [timerSec,  setTimerSec]  = useState((exam?.thoiLuong || 45) * 60);
  const alertTimer = useRef(null);

  // ── Init: start exam + fetch questions ──
  useEffect(() => {
    const init = async () => {
      try {
        const bl = await startExam(exam?.maBaiThi);
        if (bl?.maBaiLam) setBaiLamId(bl.maBaiLam);
      } catch {}
      try {
        const qs = await getQuestions(exam?.maBaiThi);
        setQuestions(Array.isArray(qs) && qs.length ? qs : MOCK_QUESTIONS);
      } catch {
        setQuestions(MOCK_QUESTIONS);
      }
      setLoading(false);
    };
    init();
  }, []);

  // ── Timer ──
  useEffect(() => {
    if (loading || submitted) return;
    const id = setInterval(() => {
      setTimerSec(t => {
        if (t <= 1) { clearInterval(id); doSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [loading, submitted]);

  // ── Anti-cheat ──
  const triggerAlert = useCallback((msg) => {
    setViols(v => v + 1);
    setAlert({ show: true, msg });
    clearTimeout(alertTimer.current);
    alertTimer.current = setTimeout(() => setAlert({ show: false, msg: "" }), 4000);
    reportViolation();
  }, []);

  useEffect(() => {
    if (submitted) return;
    const onCopy    = () => triggerAlert("⚠️ Vi phạm: Sao chép nội dung bị ghi lại!");
    const onPaste   = () => triggerAlert("⚠️ Vi phạm: Dán nội dung bị ghi lại!");
    const onVisible = () => { if (document.hidden) triggerAlert("⚠️ Vi phạm: Chuyển tab bị ghi lại!"); };
    const noCtx     = (e) => e.preventDefault();
    document.addEventListener("copy",  onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("visibilitychange", onVisible);
    document.addEventListener("contextmenu", noCtx);
    return () => {
      document.removeEventListener("copy",  onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("contextmenu", noCtx);
    };
  }, [submitted, triggerAlert]);

  // ── Submit ──
  const doSubmit = async () => {
    setShowModal(false);
    setSubmitted(true);
    const { diem10 } = gradeExam(questions, answers);
    try { await submitExam(baiLamId, diem10); } catch {}
  };

  const setAns = (maCauHoi, val) => setAnswers(a => ({ ...a, [maCauHoi]: val }));

  // ── Derived ──
  const answered = questions.filter(q => answers[q.maCauHoi] != null).length;
  const timerColor = timerSec < 60 ? "#E24B4A" : timerSec < 300 ? "#BA7517" : "#3C3489";
  const timerBg    = timerSec < 60 ? "#FCEBEB" : timerSec < 300 ? "#FAEEDA" : "#EEEDFE";

  // ── Result screen ──
  if (submitted) {
    const { diem10, tiLe } = gradeExam(questions, answers);
    const pass = diem10 >= 5;
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(135deg,#f0effe,#e1f5ee)", fontFamily:"'Nunito',sans-serif", padding:24 }}>
        <div style={RS.card}>
          <div style={{ fontSize:64, marginBottom:16 }}>{pass ? "🎉" : "😔"}</div>
          <div style={{ fontFamily:"'Baloo 2',sans-serif", fontSize:26, fontWeight:800,
            color: pass?"#085041":"#A32D2D", marginBottom:8 }}>
            {pass ? "Chúc mừng! Đạt môn" : "Chưa đạt — Cố lên!"}
          </div>
          <div style={{ fontSize:14, color:"#888780", marginBottom:28 }}>Kết quả đã được ghi nhận</div>
          <div style={{ display:"flex", justifyContent:"center", gap:32, marginBottom:28 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Baloo 2',sans-serif", fontSize:52, fontWeight:800,
                color: diem10>=8?"#085041":diem10>=6.5?"#534AB7":diem10>=5?"#633806":"#A32D2D" }}>
                {diem10}
              </div>
              <div style={{ fontSize:13, color:"#888780", fontWeight:600 }}>Điểm / 10</div>
            </div>
            <div style={{ width:1, background:"#EEEDFE" }} />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Baloo 2',sans-serif", fontSize:52, fontWeight:800, color:"#E24B4A" }}>
                {violations}
              </div>
              <div style={{ fontSize:13, color:"#888780", fontWeight:600 }}>Vi phạm</div>
            </div>
          </div>
          {/* Per-question breakdown */}
          <div style={RS.breakdown}>
            {questions.map((q, i) => {
              const got  = gradeQuestion(q, answers[q.maCauHoi]);
              const full = got >= q.diem;
              const half = got > 0 && !full;
              return (
                <div key={q.maCauHoi} style={RS.row}>
                  <span style={{ fontSize:16 }}>{full?"✅":half?"🟡":"❌"}</span>
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color:"#444441" }}>
                    Câu {i+1} — {LOAI_CAU_HOI[q.loaiCauHoi]?.label}
                  </span>
                  <span style={{ fontWeight:700, color: full?"#085041":half?"#633806":"#A32D2D" }}>
                    {got}/{q.diem}đ
                  </span>
                </div>
              );
            })}
          </div>
          <button style={RS.btn} onClick={onBack}>← Về trang chủ</button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      height:"100vh", fontFamily:"'Nunito',sans-serif", fontSize:18, color:"#7F77DD" }}>
      ⏳ Đang tải đề thi...
    </div>
  );

  const q = questions[current];

  return (
    <div style={S.page}>
      {/* Alert banner */}
      <div style={{ ...S.alertBanner, transform: alert.show ? "translateY(0)" : "translateY(-110%)" }}>
        {alert.msg}
        <span style={{ marginLeft:"auto", cursor:"pointer", fontSize:18 }}
          onClick={() => setAlert({ show:false, msg:"" })}>✕</span>
      </div>

      {/* Topbar */}
      <div style={S.topbar}>
        <div style={{ flex:1 }}>
          <div style={S.examTitle}>🎓 {exam?.tenBaiThi || "Bài thi"}</div>
          <div style={S.examSub}>{exam?.tenMonThi} · {exam?.thoiLuong} phút</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {violations > 0 && (
            <div style={S.viphamChip}>⚠️ {violations} vi phạm</div>
          )}
          <div style={{ ...S.timer, color:timerColor, background:timerBg }}>
            ⏱ {formatCountdown(timerSec)}
          </div>
          <button style={S.btnSubmit} onClick={() => setShowModal(true)}>Nộp bài</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={S.progressWrap}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#888780", marginBottom:5 }}>
          <span>Tiến độ làm bài</span>
          <span>{answered}/{questions.length} câu đã trả lời</span>
        </div>
        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width:`${(answered/questions.length)*100}%` }} />
        </div>
      </div>

      {/* Question nav */}
      <div style={S.qnav}>
        {questions.map((qq, i) => (
          <button key={qq.maCauHoi}
            style={{
              ...S.qdot,
              ...(answers[qq.maCauHoi] != null ? S.qdotDone : {}),
              ...(i === current ? S.qdotCur : {}),
            }}
            onClick={() => setCurrent(i)}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div style={S.main}>
        <div style={S.qcard}>
          {/* Header */}
          <div style={S.qhead}>
            <div style={S.qnum}>{current + 1}</div>
            <span style={{
              ...S.qbadge,
              background: LOAI_CAU_HOI[q.loaiCauHoi]?.bg,
              color:      LOAI_CAU_HOI[q.loaiCauHoi]?.color,
            }}>
              {LOAI_CAU_HOI[q.loaiCauHoi]?.label}
            </span>
            <span style={S.qscore}>Điểm: <strong style={{ color:"#7F77DD" }}>{q.diem}</strong></span>
          </div>

          {/* Question text */}
          <div style={S.qtext}>
            {q.loaiCauHoi === 4 ? "Điền vào chỗ trống phù hợp:" : q.noiDung}
          </div>

          {/* Answer area */}
          {q.loaiCauHoi === 1 && (
            <TracNghiem q={q} ans={answers[q.maCauHoi]}
              onChange={v => setAns(q.maCauHoi, v)} />
          )}
          {q.loaiCauHoi === 2 && (
            <DungSai q={q} ans={answers[q.maCauHoi]}
              onChange={v => setAns(q.maCauHoi, v)} />
          )}
          {q.loaiCauHoi === 4 && (
            <DienChoTrong q={q} ans={answers[q.maCauHoi]}
              onChange={v => setAns(q.maCauHoi, v)} />
          )}
          {q.loaiCauHoi === 3 && (
            <GhepTu q={q} ans={answers[q.maCauHoi]}
              onChange={v => setAns(q.maCauHoi, v)} />
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
          <button style={{ ...S.navBtn, opacity: current===0?0.35:1 }}
            disabled={current===0} onClick={() => setCurrent(c=>c-1)}>
            ◀ Câu trước
          </button>
          <button style={{ ...S.navBtn, opacity: current===questions.length-1?0.35:1 }}
            disabled={current===questions.length-1} onClick={() => setCurrent(c=>c+1)}>
            Câu tiếp ▶
          </button>
        </div>
      </div>

      {/* Submit modal */}
      {showModal && (
        <div style={S.overlay}>
          <div style={S.modalCard}>
            <div style={{ fontSize:44, marginBottom:12 }}>📋</div>
            <div style={{ fontFamily:"'Baloo 2',sans-serif", fontSize:20, fontWeight:800,
              color:"#3C3489", marginBottom:8 }}>Xác nhận nộp bài</div>
            <div style={{ fontSize:13, color:"#888780", marginBottom:20 }}>
              Đã trả lời <strong style={{ color:"#7F77DD" }}>{answered}</strong>/{questions.length} câu.
              Còn <strong style={{ color:"#E24B4A" }}>{questions.length-answered}</strong> câu chưa làm.
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button style={S.btnCancel} onClick={() => setShowModal(false)}>Quay lại</button>
              <button style={S.btnConfirm} onClick={doSubmit}>Nộp bài ngay ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Answer components ─────────────────────────────────────

function TracNghiem({ q, ans, onChange }) {
  const keys = ["A","B","C","D"];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      {q.dapAnTracNghiem?.map((opt, i) => {
        const sel = ans === opt.maDapAn;
        return (
          <button key={opt.maDapAn}
            style={{ ...A.choice, ...(sel ? A.choiceSel : {}) }}
            onClick={() => onChange(opt.maDapAn)}>
            <span style={{ ...A.key, ...(sel ? A.keySel : {}) }}>{keys[i]}</span>
            {opt.noiDungDapAn}
          </button>
        );
      })}
    </div>
  );
}

function DungSai({ ans, onChange }) {
  return (
    <div style={{ display:"flex", gap:12 }}>
      {[{ val:true, label:"✅ Đúng" }, { val:false, label:"❌ Sai" }].map(o => (
        <button key={String(o.val)}
          style={{
            ...A.bool,
            ...(ans===o.val ? (o.val ? A.boolTrue : A.boolFalse) : {}),
          }}
          onClick={() => onChange(o.val)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DienChoTrong({ q, ans = [], onChange }) {
  const blanks = q.dapAnDienChoTrong || [];
  const parts  = q.noiDung.split("_____");
  return (
    <div style={{ fontSize:15, fontWeight:600, color:"#2C2C2A", lineHeight:2.4,
      display:"flex", flexWrap:"wrap", alignItems:"center", gap:4 }}>
      {parts.map((part, i) => (
        <span key={i} style={{ display:"contents" }}>
          <span>{part}</span>
          {i < parts.length-1 && (
            <input style={A.fillInput}
              placeholder={`Từ ${i+1}...`}
              value={ans[i] || ""}
              onChange={e => {
                const next = [...ans]; next[i] = e.target.value; onChange(next);
              }} />
          )}
        </span>
      ))}
    </div>
  );
}

function GhepTu({ q, ans = {}, onChange }) {
  const [selLeft, setSelLeft] = useState(null);
  const pairs  = q.dapAnGhepTu || [];
  const rights = pairs.map(p => p.vePhai);

  const pickLeft  = (maGhep) => setSelLeft(maGhep);
  const pickRight = (vePhai) => {
    if (selLeft == null) return;
    const next = { ...ans };
    Object.keys(next).forEach(k => { if (next[k]===vePhai) delete next[k]; });
    next[selLeft] = vePhai;
    onChange(next);
    setSelLeft(null);
  };

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <div style={A.matchLabel}>Khái niệm</div>
          {pairs.map(p => (
            <div key={p.maGhep}
              style={{ ...A.matchLeft, ...(selLeft===p.maGhep ? A.matchLeftSel : {}) }}
              onClick={() => pickLeft(p.maGhep)}>
              🔵 {p.veTrai}
              {ans[p.maGhep] && (
                <span style={A.matchTag}>→ {ans[p.maGhep]}</span>
              )}
            </div>
          ))}
        </div>
        <div>
          <div style={A.matchLabel}>Định nghĩa</div>
          {rights.map((r, i) => {
            const filled = Object.values(ans).includes(r);
            return (
              <div key={i}
                style={{ ...A.matchRight, ...(filled ? A.matchRightFilled : {}) }}
                onClick={() => pickRight(r)}>
                {r}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ fontSize:12, color:"#888780", marginTop:8 }}>
        💡 Bấm khái niệm rồi bấm định nghĩa để ghép nối
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────
const S = {
  page:        { minHeight:"100vh", background:"linear-gradient(135deg,#f0effe,#e1f5ee,#fbeaf0)",
                 fontFamily:"'Nunito',sans-serif" },
  alertBanner: { position:"fixed", top:0, left:0, right:0, background:"#E24B4A", color:"white",
                 padding:"10px 20px", display:"flex", alignItems:"center", gap:10,
                 fontSize:14, fontWeight:700, zIndex:9999, transition:"transform 0.3s ease" },
  topbar:      { background:"white", borderBottom:"2px solid #EEEDFE", padding:"12px 24px",
                 display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 },
  examTitle:   { fontFamily:"'Baloo 2',sans-serif", fontSize:16, fontWeight:800, color:"#3C3489" },
  examSub:     { fontSize:12, color:"#888780", fontWeight:600 },
  timer:       { borderRadius:24, padding:"6px 16px", fontFamily:"'Baloo 2',sans-serif",
                 fontSize:20, fontWeight:800, letterSpacing:2, minWidth:80, textAlign:"center" },
  viphamChip:  { background:"#FCEBEB", border:"1px solid #F09595", borderRadius:20,
                 padding:"4px 10px", fontSize:12, fontWeight:700, color:"#A32D2D" },
  btnSubmit:   { background:"linear-gradient(135deg,#7F77DD,#534AB7)", color:"white",
                 border:"none", borderRadius:20, padding:"8px 20px", fontSize:14,
                 fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(127,119,221,0.4)" },
  progressWrap:{ background:"white", padding:"8px 24px 10px", borderBottom:"1px solid #EEEDFE" },
  progressBar: { height:6, background:"#EEEDFE", borderRadius:6, overflow:"hidden" },
  progressFill:{ height:"100%", background:"linear-gradient(90deg,#7F77DD,#1D9E75)",
                 borderRadius:6, transition:"width 0.4s" },
  qnav:        { background:"white", borderBottom:"1px solid #EEEDFE", padding:"8px 24px",
                 display:"flex", gap:6, flexWrap:"wrap" },
  qdot:        { width:30, height:30, borderRadius:"50%", border:"2px solid #D3D1C7",
                 background:"white", fontSize:12, fontWeight:700, cursor:"pointer",
                 color:"#888780", display:"flex", alignItems:"center", justifyContent:"center" },
  qdotDone:    { background:"#7F77DD", borderColor:"#7F77DD", color:"white" },
  qdotCur:     { borderColor:"#7F77DD", boxShadow:"0 0 0 3px rgba(127,119,221,0.2)" },
  main:        { padding:20, maxWidth:760, margin:"0 auto" },
  qcard:       { background:"white", borderRadius:20, padding:24,
                 boxShadow:"0 4px 20px rgba(0,0,0,0.06)", marginBottom:0 },
  qhead:       { display:"flex", alignItems:"center", gap:10, marginBottom:16 },
  qnum:        { width:36, height:36, borderRadius:"50%",
                 background:"linear-gradient(135deg,#7F77DD,#534AB7)", color:"white",
                 fontFamily:"'Baloo 2',sans-serif", fontWeight:800, fontSize:14,
                 display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  qbadge:      { fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:12,
                 textTransform:"uppercase", letterSpacing:"0.5px" },
  qscore:      { marginLeft:"auto", fontSize:12, color:"#888780" },
  qtext:       { fontSize:15, fontWeight:600, color:"#2C2C2A", lineHeight:1.6, marginBottom:18 },
  navBtn:      { background:"white", border:"2px solid #EEEDFE", borderRadius:20,
                 padding:"8px 20px", fontFamily:"'Nunito',sans-serif", fontWeight:700,
                 fontSize:14, cursor:"pointer", color:"#534AB7" },
  overlay:     { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
                 display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 },
  modalCard:   { background:"white", borderRadius:24, padding:32, maxWidth:380,
                 width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" },
  btnCancel:   { background:"white", border:"2px solid #EEEDFE", borderRadius:20,
                 padding:"10px 20px", fontFamily:"'Nunito',sans-serif",
                 fontWeight:700, fontSize:14, cursor:"pointer", color:"#888780" },
  btnConfirm:  { background:"linear-gradient(135deg,#7F77DD,#534AB7)", color:"white",
                 border:"none", borderRadius:20, padding:"10px 24px",
                 fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" },
};

const A = {
  choice:         { background:"#F8F7FF", border:"2px solid #EEEDFE", borderRadius:14,
                    padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center",
                    gap:10, textAlign:"left", fontFamily:"'Nunito',sans-serif",
                    fontSize:14, color:"#444441", fontWeight:600 },
  choiceSel:      { background:"#7F77DD", borderColor:"#534AB7", color:"white" },
  key:            { width:26, height:26, borderRadius:"50%", background:"white",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:800, color:"#7F77DD", flexShrink:0,
                    border:"2px solid #EEEDFE" },
  keySel:         { color:"#534AB7" },
  bool:           { flex:1, padding:14, border:"2px solid #D3D1C7", borderRadius:16,
                    cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:15,
                    fontWeight:700, display:"flex", alignItems:"center",
                    justifyContent:"center", gap:8, background:"white", color:"#444441" },
  boolTrue:       { background:"#E1F5EE", borderColor:"#1D9E75", color:"#085041" },
  boolFalse:      { background:"#FCEBEB", borderColor:"#E24B4A", color:"#501313" },
  fillInput:      { border:"none", borderBottom:"3px solid #7F77DD", background:"#F8F7FF",
                    padding:"4px 12px", borderRadius:"8px 8px 0 0",
                    fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:700,
                    color:"#3C3489", width:130, outline:"none" },
  matchLabel:     { fontSize:11, fontWeight:800, color:"#888780", textTransform:"uppercase",
                    letterSpacing:1, marginBottom:6 },
  matchLeft:      { background:"#FAEEDA", border:"2px solid #FAC775", borderRadius:12,
                    padding:"10px 14px", fontSize:13, fontWeight:700, color:"#633806",
                    cursor:"pointer", marginBottom:8, display:"flex",
                    alignItems:"center", gap:6, flexWrap:"wrap" },
  matchLeftSel:   { background:"#7F77DD", borderColor:"#534AB7", color:"white" },
  matchTag:       { background:"white", color:"#534AB7", borderRadius:8,
                    padding:"2px 6px", fontSize:11, fontWeight:700, marginLeft:"auto" },
  matchRight:     { background:"#F8F7FF", border:"2px dashed #AFA9EC", borderRadius:12,
                    padding:"10px 14px", fontSize:13, fontWeight:600, color:"#888780",
                    minHeight:44, display:"flex", alignItems:"center",
                    cursor:"pointer", marginBottom:8 },
  matchRightFilled:{ background:"#EEEDFE", borderStyle:"solid", borderColor:"#7F77DD",
                     color:"#3C3489", fontWeight:700 },
};

const RS = {
  card:      { background:"white", borderRadius:24, padding:40, maxWidth:500, width:"100%",
               textAlign:"center", boxShadow:"0 20px 60px rgba(127,119,221,0.18)" },
  breakdown: { background:"#F8F7FF", borderRadius:14, padding:16, marginBottom:24, textAlign:"left" },
  row:       { display:"flex", alignItems:"center", gap:10, padding:"6px 0",
               borderBottom:"1px solid #EEEDFE" },
  btn:       { background:"linear-gradient(135deg,#7F77DD,#534AB7)", color:"white",
               border:"none", borderRadius:16, padding:"14px 32px", fontSize:15,
               fontFamily:"'Nunito',sans-serif", fontWeight:800, cursor:"pointer",
               boxShadow:"0 6px 20px rgba(127,119,221,0.4)", width:"100%" },
};
