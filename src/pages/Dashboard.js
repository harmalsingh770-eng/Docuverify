import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // FIX: auth.currentUser is null right after login — Firebase hasn't loaded yet.
    // onAuthStateChanged waits for auth to be ready before checking.
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "schools", user.uid));
        const data = snap.data();

        if (!data) {
          navigate("/setup-school");
          return;
        }

        if (!data.isPaid) {
          navigate("/payment");
          return;
        }

        setUserName(data.name || data.code || "");
        setReady(true);
      } catch (err) {
        console.error(err);
        setReady(true);
      }
    });

    return unsub;
  }, [navigate]);

  const cards = [
    { label: "🎓 Students", path: "/students" },
    { label: "📚 Classes", path: "/classes" },
    { label: "📄 Documents", path: "/required-docs" },
    { label: "💳 Payment", path: "/payment" },
    { label: "🔧 Setup School", path: "/setup-school" },
  ];

  if (!ready) {
    return (
      <div style={styles.loading}>
        <p style={{ color: "#fff", fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🏫 Dashboard</h1>
      {userName ? <p style={styles.sub}>Welcome, {userName}</p> : null}

      <div style={styles.grid}>
        {cards.map((c) => (
          <div key={c.path} style={styles.card} onClick={() => navigate(c.path)}>
            <h3 style={styles.cardLabel}>{c.label}</h3>
          </div>
        ))}
      </div>

      <button style={styles.logout} onClick={() => { auth.signOut(); navigate("/"); }}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  loading: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 30,
    minHeight: "100vh",
    background: "#f5f7fa",
    textAlign: "center",
  },
  heading: { fontSize: 30, color: "#1e293b", margin: 0 },
  sub: { color: "#64748b", marginBottom: 30 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
    maxWidth: 800,
    margin: "20px auto 30px",
  },
  card: {
    background: "#fff",
    padding: 28,
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    cursor: "pointer",
  },
  cardLabel: { margin: 0, color: "#1e293b", fontSize: 17 },
  logout: {
    padding: "10px 28px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
};
