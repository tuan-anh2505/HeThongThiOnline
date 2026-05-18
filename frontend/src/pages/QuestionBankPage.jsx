import { useState, useEffect } from "react";
import { createCauHoi, getAllCauHoi, deleteCauHoi, getCauHoiById, updateCauHoi } from "../services/api";

// ĐÃ CẬP NHẬT ĐỦ 7 NGÂN HÀNG THEO ĐÚNG SQL
const MOCK_NGAN_HANG = [
  { id: 6, name: "Ngân hàng Lập trình mạng" },
  { id: 7, name: "Ngân hàng Cơ sở dữ liệu" },
  { id: 8, name: "Ngân hàng Triết học" },
  { id: 9, name: "Ngân hàng Tư tưởng HCM" },
  { id: 10, name: "Ngân hàng Lập trình Web" },
  { id: 11, name: "Ngân hàng Lập trình C" },
  { id: 12, name: "Ngân hàng Java cơ bản" }
];

export default function QuestionBankPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("list"); 
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  // BIẾN STATE MỚI ĐỂ LỌC NGÂN HÀNG
  const [filterBank, setFilterBank] = useState("all");

  const [formData, setFormData] = useState({
    maNganHang: 1, noiDung: "", loaiCauHoi: 1, diem: 1.0
  });

  const [answers, setAnswers] = useState([
    { noiDungDapAn: "", laDapAnDung: true }, 
    { noiDungDapAn: "", laDapAnDung: false },
    { noiDungDapAn: "", laDapAnDung: false },
    { noiDungDapAn: "", laDapAnDung: false }
  ]);

  useEffect(() => {
    if (activeTab === "list") {
        fetchQuestions();
        setEditingId(null); 
    }
  }, [activeTab]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getAllCauHoi();
      setQuestions(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEditClick = async (id) => {
    try {
        const data = await getCauHoiById(id);
        setEditingId(id);
        setFormData({
            maNganHang: data.maNganHang,
            noiDung: data.noiDung,
            loaiCauHoi: data.loaiCauHoi,
            diem: data.diem
        });
        if (data.dapAnTracNghiem) {
            setAnswers(data.dapAnTracNghiem.map(a => ({
                noiDungDapAn: a.noiDungDapAn,
                laDapAnDung: a.laDapAnDung === true || a.laDapAnDung === 1
            })));
        }
        setActiveTab("add"); 
    } catch (error) { alert("Lỗi tải chi tiết câu hỏi"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Xóa câu hỏi #${id}?`)) return;
    try {
      await deleteCauHoi(id);
      fetchQuestions();
    } catch (error) { alert("Lỗi xóa!"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, dapAnTracNghiem: answers };

    try {
      if (editingId) {
        await updateCauHoi(editingId, payload);
        alert("✅ Cập nhật câu hỏi thành công!");
      } else {
        await createCauHoi(payload);
        alert("✅ Thêm câu hỏi mới thành công!");
      }
      setActiveTab("list");
    } catch (error) { alert("Lỗi khi lưu dữ liệu!"); }
  };

  const getBankName = (id) => MOCK_NGAN_HANG.find(n => n.id === id)?.name || `NH số ${id}`;

  // THUẬT TOÁN LỌC CÂU HỎI
  const displayedQuestions = filterBank === "all" 
    ? questions 
    : questions.filter(q => q.maNganHang === parseInt(filterBank));

  return (
    <div style={{ padding: "30px 40px", background: "#F0FBF8", minHeight: "100vh", fontFamily: "'Nunito', sans-serif" }}>
      <button onClick={onBack} style={{ background: "#E6F7F3", color: "#0F8A6E", border: "1px solid #0F8A6E", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" }}>
        ⬅ Quay lại Quản lý Bài thi
      </button>

      <div style={{ maxWidth: "1000px", margin: "0 auto", background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        
        {/* HEADER GỒM TAB (TRÁI) VÀ BỘ LỌC (PHẢI) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #E6F7F3", paddingBottom: "15px", marginBottom: "20px" }}>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setActiveTab("list")} style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", background: activeTab === "list" ? "#0F8A6E" : "#F0FBF8", color: activeTab === "list" ? "white" : "#0F8A6E" }}>
              📋 Danh sách Câu hỏi
            </button>
            <button onClick={() => { setEditingId(null); setFormData({maNganHang:1, noiDung:"", loaiCauHoi:1, diem:1.0}); setActiveTab("add"); }} style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", background: activeTab === "add" ? "#0F8A6E" : "#F0FBF8", color: activeTab === "add" ? "white" : "#0F8A6E" }}>
              ➕ {editingId ? "Đang Sửa Câu Hỏi" : "Thêm Câu hỏi mới"}
            </button>
          </div>

          {/* Ô CHỌN BỘ LỌC (Chỉ hiện khi ở tab Danh sách) */}
          {activeTab === "list" && (
            <div>
              <select 
                value={filterBank} 
                onChange={(e) => setFilterBank(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "2px solid #0F8A6E", background: "white", color: "#0F8A6E", fontWeight: "bold", outline: "none", cursor: "pointer" }}
              >
                <option value="all">📚 Tất cả Ngân hàng</option>
                {MOCK_NGAN_HANG.map(nh => (
                  <option key={nh.id} value={nh.id}>{nh.name}</option>
                ))}
              </select>
            </div>
          )}

        </div>

        {activeTab === "list" ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <h2 style={{ color: "#0F8A6E", margin: 0 }}>Kho Câu Hỏi</h2>
              <span style={{ color: "#888", fontWeight: "bold", fontSize: "14px" }}>
                Đang hiển thị {displayedQuestions.length} câu hỏi
              </span>
            </div>

            {loading ? <p>Đang tải dữ liệu...</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                <thead>
                  <tr style={{ background: "#E6F7F3", color: "#065C49" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderRadius: "8px 0 0 8px" }}>Mã</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Thuộc Ngân hàng</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Nội dung</th>
                    <th style={{ padding: "12px", textAlign: "center", borderRadius: "0 8px 8px 0" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedQuestions.length === 0 ? (
                     <tr><td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#888" }}>Không tìm thấy câu hỏi nào trong ngân hàng này.</td></tr>
                  ) : (
                    displayedQuestions.map(q => (
                      <tr key={q.maCauHoi} style={{ borderBottom: "1px solid #EEE" }}>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>#{q.maCauHoi}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ background: "#F0FBF8", color: "#0F8A6E", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                            {getBankName(q.maNganHang)}
                          </span>
                        </td>
                        <td style={{ padding: "12px", maxWidth: "350px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.noiDung}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button onClick={() => handleEditClick(q.maCauHoi)} style={{ background: "#EBF3FE", color: "#185ADB", border: "none", padding: "6px 12px", borderRadius: "6px", marginRight: "5px", cursor: "pointer", fontWeight: "bold" }}>Sửa</button>
                          <button onClick={() => handleDelete(q.maCauHoi)} style={{ background: "#FEECEB", color: "#D32F2F", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Xóa</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
             <h2 style={{ color: "#0F8A6E", margin: 0 }}>{editingId ? `📝 Chỉnh sửa câu hỏi #${editingId}` : "➕ Thêm câu hỏi mới"}</h2>
             <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: "bold" }}>Ngân hàng:</label>
                  <select value={formData.maNganHang} onChange={(e) => setFormData({...formData, maNganHang: parseInt(e.target.value)})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}>
                    {MOCK_NGAN_HANG.map(nh => <option key={nh.id} value={nh.id}>{nh.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: "bold" }}>Điểm:</label>
                  <input type="number" step="0.5" value={formData.diem} onChange={(e) => setFormData({...formData, diem: parseFloat(e.target.value)})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
                </div>
              </div>
              <div>
                <label style={{ fontWeight: "bold" }}>Nội dung:</label>
                <textarea rows="3" required value={formData.noiDung} onChange={(e) => setFormData({...formData, noiDung: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>Đáp án (Chọn Radio để đặt làm đáp án ĐÚNG):</label>
                {answers.map((ans, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "center", padding: "10px", background: ans.laDapAnDung ? "#E6F7F3" : "#f9f9f9", borderRadius: "8px", border: ans.laDapAnDung ? "2px solid #0F8A6E" : "1px solid #eee" }}>
                    <input type="radio" checked={ans.laDapAnDung} onChange={() => setAnswers(answers.map((a, i) => ({...a, laDapAnDung: i === idx})))} style={{ cursor: "pointer", width: "18px", height: "18px" }} />
                    <span style={{ fontWeight: "bold", color: "#555" }}>{String.fromCharCode(65 + idx)}.</span>
                    <input type="text" required value={ans.noiDungDapAn} onChange={(e) => {
                        const newAns = [...answers];
                        newAns[idx].noiDungDapAn = e.target.value;
                        setAnswers(newAns);
                    }} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc", outline: "none" }} />
                  </div>
                ))}
              </div>
              <button type="submit" style={{ background: "#0F8A6E", color: "white", padding: "14px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>
                {editingId ? "💾 Cập nhật thay đổi" : "🚀 Lưu câu hỏi mới"}
              </button>
          </form>
        )}
      </div>
    </div>
  );
}