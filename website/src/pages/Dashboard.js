import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    { label: "🎓 Students", path: "/students" },
    { label: "📚 Classes", path: "/classes" },
    { label: "📄 Documents", path: "/required-docs" },
    { label: "💳 Payment", path: "/payment" },
    { label: "🔧 Setup School", path: "/setup-school" },
    { label: "🛡️ Admin Panel", path: "/admin" },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Dashboard</h1>
      <p style={styles.sub}>Welcome back! Manage your school below.</p>

      <div style={styles.grid}>
        {cards.map((c) => (
          <div key={c.path} style={styles.card} onClick={() => navigate(c.path)}>
            <h3 style={styles.cardLabel}>{c.label}</h3>
          </div>
        ))}
      </div>

      <button style={styles.logout} onClick={() => navigate("/")}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: 30,
    minHeight: "100vh",
    background: "#f5f7fa",
    textAlign: "center",
  },
  heading: {
    fontSize: 32,
    color: "#1e293b",
    margin: 0,
  },
  sub: {
    color: "#64748b",
    marginBottom: 36,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
    maxWidth: 800,
    margin: "0 auto",
  },
  card: {
    background: "#fff",
    padding: 28,
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  cardLabel: {
    margin: 0,
    color: "#1e293b",
    fontSize: 17,
  },
  logout: {
    marginTop: 40,
    padding: "10px 28px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
  },
};
