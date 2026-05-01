import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate("/dashboard")}>← Back</button>
      <h1 style={styles.title}>Admin Panel</h1>
      <p style={styles.subtitle}>Manage Schools & Payments</p>

      <div style={styles.grid}>
        <div style={styles.card} onClick={() => alert("Approve Schools — connect your Firestore logic here")}>
          <h3>🏫 Approve Schools</h3>
          <p>Review and approve new schools</p>
        </div>
        <div style={styles.card} onClick={() => alert("Payments — connect your Firestore logic here")}>
          <h3>💳 Payments</h3>
          <p>Check and verify transactions</p>
        </div>
        <div style={styles.card} onClick={() => navigate("/review-doc")}>
          <h3>📄 Documents</h3>
          <p>Review uploaded documents</p>
        </div>
      </div>

      <button style={styles.logout} onClick={() => navigate("/")}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#020617",
    color: "#fff",
    padding: 30,
    textAlign: "center",
  },
  back: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 20,
    display: "block",
  },
  title: { fontSize: 32, fontWeight: "bold", margin: 0 },
  subtitle: { color: "#94a3b8", margin: "10px 0 30px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    maxWidth: 900,
    margin: "0 auto",
  },
  card: {
    background: "#0f172a",
    padding: 24,
    borderRadius: 14,
    cursor: "pointer",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
  },
  logout: {
    marginTop: 40,
    padding: "12px 30px",
    background: "#ef4444",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
};
