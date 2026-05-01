import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

export default function RequiredDocsPage() {
  const [title, setTitle] = useState("");
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = location.state?.studentId;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "requiredDocs"), (snap) => {
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const addDocReq = async () => {
    if (!title) return alert("Enter document name");
    await addDoc(collection(db, "requiredDocs"), { title });
    setTitle("");
  };

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate(-1)}>← Back</button>
      <h2 style={styles.title}>Required Documents</h2>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Enter document name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button style={styles.addBtn} onClick={addDocReq}>Add</button>
      </div>

      <div style={styles.grid}>
        {docs.map((item) => (
          <div
            key={item.id}
            style={styles.card}
            onClick={() =>
              navigate("/upload-doc", {
                state: { studentId, docId: item.id },
              })
            }
          >
            <h3 style={styles.cardTitle}>{item.title}</h3>
            <p style={styles.cardSub}>Click to upload ↑</p>
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
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
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
  title: { fontSize: 26, marginBottom: 20 },
  inputRow: { display: "flex", gap: 10, marginBottom: 30 },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "none",
    outline: "none",
    fontSize: 14,
  },
  addBtn: {
    padding: "12px 22px",
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
    background: "rgba(255,255,255,0.1)",
    padding: 22,
    borderRadius: 14,
    cursor: "pointer",
    backdropFilter: "blur(8px)",
  },
  cardTitle: { margin: "0 0 6px", fontSize: 18 },
  cardSub: { margin: 0, color: "#93c5fd", fontSize: 13 },
};
