import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ClassesPage() {
  const [name, setName] = useState("");
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const schoolId = "demoSchool";

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes"), (snap) => {
      setClasses(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => c.schoolId === schoolId)
      );
    });
    return unsub;
  }, []);

  const addClass = async () => {
    if (!name) return alert("Enter class name");
    await addDoc(collection(db, "classes"), {
      name,
      schoolId,
      createdAt: new Date(),
    });
    setName("");
  };

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate("/dashboard")}>← Back</button>
      <h2 style={styles.title}>Classes</h2>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Enter class name (e.g. 10th A)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button style={styles.addBtn} onClick={addClass}>Add</button>
      </div>

      <div style={styles.grid}>
        {classes.map((item) => (
          <div
            key={item.id}
            style={styles.card}
            onClick={() => navigate("/students", { state: { classId: item.id } })}
          >
            <h3 style={styles.cardTitle}>{item.name}</h3>
            <p style={styles.cardSub}>Open Students →</p>
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
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
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
    backdropFilter: "blur(10px)",
  },
  cardTitle: { margin: "0 0 6px", fontSize: 18 },
  cardSub: { margin: 0, color: "#94a3b8", fontSize: 13 },
};
