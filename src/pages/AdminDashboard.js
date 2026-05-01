import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { isAdmin } from "../config/admin";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // FIX: was importing from "../lib/firebase" which doesn't exist
    // Also fixed to use onAuthStateChanged instead of assuming auth is ready
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { navigate("/"); return; }

      if (!isAdmin(u)) {
        alert("Access Denied");
        navigate("/");
        return;
      }

      setUser(u);
      fetchAll();
    });
    return unsub;
  }, [navigate]);

  const fetchAll = async () => {
    const schoolSnap = await getDocs(collection(db, "schools"));
    const studentSnap = await getDocs(collection(db, "students"));
    setSchools(schoolSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setStudents(studentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const approveSchool = async (id) => {
    await updateDoc(doc(db, "schools", id), { isApproved: true });
    fetchAll();
    alert("School approved!");
  };

  if (!user) return (
    <div style={styles.loading}><p style={{ color: "#fff" }}>Loading...</p></div>
  );

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate("/")}>← Logout</button>
      <h1 style={styles.title}>👑 Admin Panel</h1>

      <h2 style={styles.section}>🏫 Schools</h2>
      {schools.length === 0 && <p style={styles.empty}>No schools yet.</p>}
      {schools.map(s => (
        <div key={s.id} style={styles.card}>
          <b>{s.name || s.code}</b> — Status: {s.isApproved ? "✅ Approved" : "⏳ Pending"}
          {!s.isApproved && (
            <button style={styles.approveBtn} onClick={() => approveSchool(s.id)}>
              Approve
            </button>
          )}
        </div>
      ))}

      <h2 style={styles.section}>👨‍🎓 Students</h2>
      {students.length === 0 && <p style={styles.empty}>No students yet.</p>}
      {students.map(s => (
        <div key={s.id} style={styles.card}>
          {s.name} — Roll: {s.rollNo || "N/A"}
        </div>
      ))}
    </div>
  );
}

const styles = {
  loading: {
    minHeight: "100vh", background: "#020617",
    display: "flex", justifyContent: "center", alignItems: "center",
  },
  container: {
    minHeight: "100vh", background: "#020617",
    color: "#fff", padding: 30,
  },
  back: {
    background: "transparent", border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 20,
  },
  title: { fontSize: 28, marginBottom: 10 },
  section: { color: "#94a3b8", marginTop: 30, marginBottom: 10 },
  empty: { color: "#475569" },
  card: {
    background: "#0f172a", padding: 16, borderRadius: 10,
    marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  approveBtn: {
    background: "#22c55e", border: "none", color: "#fff",
    padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: "bold",
  },
};
