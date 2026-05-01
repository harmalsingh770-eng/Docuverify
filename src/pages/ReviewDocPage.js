import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";

export default function ReviewDocPage() {
  const [data, setData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, docId } = location.state || {};

  useEffect(() => {
    if (!studentId || !docId) return;
    const ref = doc(db, "students", studentId, "docs", docId);
    return onSnapshot(ref, (snap) => setData(snap.data()));
  }, [studentId, docId]);

  const update = async (status) => {
    await updateDoc(doc(db, "students", studentId, "docs", docId), { status });
    alert(`Document ${status}!`);
  };

  if (!data) {
    return (
      <div style={styles.container}>
        <p style={{ color: "#fff" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 20 }}>📄 Document Review</h2>

        <div style={styles.previewBox}>
          <a href={data.url} target="_blank" rel="noreferrer" style={styles.link}>
            Open Document 🔗
          </a>
        </div>

        <p style={styles.status}>
          Status: <b style={{ color: data.status === "approved" ? "#22c55e" : data.status === "rejected" ? "#ef4444" : "#f59e0b" }}>{data.status || "pending"}</b>
        </p>

        <div style={styles.buttons}>
          <button style={{ ...styles.btn, background: "#22c55e" }} onClick={() => update("approved")}>
            ✅ Approve
          </button>
          <button style={{ ...styles.btn, background: "#ef4444" }} onClick={() => update("rejected")}>
            ❌ Reject
          </button>
        </div>

        <button style={styles.back} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: 36,
    borderRadius: 18,
    backdropFilter: "blur(12px)",
    textAlign: "center",
    width: 380,
  },
  previewBox: {
    padding: 16,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    marginBottom: 16,
  },
  link: { color: "#93c5fd", fontWeight: "bold" },
  status: { marginBottom: 20 },
  buttons: { display: "flex", gap: 12, marginBottom: 16 },
  btn: {
    flex: 1,
    padding: 12,
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  back: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "8px 20px",
    borderRadius: 8,
    cursor: "pointer",
    width: "100%",
  },
};
