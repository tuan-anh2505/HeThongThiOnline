// ============================================================
//  components/LogoutButton.jsx
//  Nút đăng xuất nổi ở góc trên phải — dùng mọi trang
// ============================================================
export default function LogoutButton({ onLogout, hoTen, roleLabel }) {
  return (
    <div style={S.wrap}>
      <div style={S.info}>
        <div style={S.name}>{hoTen}</div>
        <div style={S.role}>{roleLabel}</div>
      </div>
      <button style={S.btn} onClick={onLogout} title="Đăng xuất">
        🚪 Đăng xuất
      </button>
    </div>
  );
}

const S = {
  wrap: {
    position: "fixed",
    top: 16,
    right: 16,
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "white",
    borderRadius: 16,
    padding: "8px 14px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    border: "1px solid #EEEDFE",
    fontFamily: "'Nunito', sans-serif",
  },
  info: { textAlign: "right" },
  name: { fontSize: 13, fontWeight: 700, color: "#2C2C2A" },
  role: { fontSize: 11, color: "#888780", fontWeight: 600 },
  btn: {
    background: "linear-gradient(135deg,#E24B4A,#A32D2D)",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
