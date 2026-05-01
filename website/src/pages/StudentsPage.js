import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const classId = location.state?.classId;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), (snap) => {
      setStudents(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => s.classId === classId)
      );
    });
    return unsub;
  }, [classId]);

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate("/classes")}>← Back</button>
      <div style={styles.header}>
        <h2 style={styles.title}>Students</h2>
        <button
          style={styles.addBtn}
          onClick={() => navigate(`/add-student/${classId}`)}
        >
          + Add Student
        </button>
      </div>

      <div style={styles.grid}>
        {students.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No students yet. Add one above.</p>
        )}
        {students.map((item) => (
          <div
            key={item.id}
            style={styles.card}
            onClick={() =>
              navigate("/required-docs", { state: { studentId: item.id } })
            }
          >
            <h3 style={styles.cardTitle}>{item.name}</h3>
            <p style={styles.cardSub}>ID: {item.id.substring(0, 6)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 30,
    minHeight: "100vh",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    color: "#fff",
  },
  back: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: { margin: 0, fontSize: 26 },
  addBtn: {
    padding: "10px 18px",
    background: "#22c55e",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    padding: 22,
    borderRadius: 14,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  cardTitle: { margin: "0 0 6px", fontSize: 18 },
  cardSub: { margin: 0, color: "#94a3b8", fontSize: 13 },
};
