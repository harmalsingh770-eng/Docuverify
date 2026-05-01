import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function SchoolSetupPage() {
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // FIX: auth.currentUser may be null — wait for auth state
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { navigate("/"); return; }
      setUser(u);
    });
    return unsub;
  }, [navigate]);

  const handleSetup = async () => {
    if (!schoolName || !address || !phone) {
      alert("Please fill all fields");
      return;
    }
    if (!user) { alert("Not logged in"); return; }

    setLoading(true);
    try {
      await updateDoc(doc(db, "schools", user.uid), {
        name: schoolName,
        address,
        phone,
      });
      navigate("/payment");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏫 Setup Your School</h2>

        <input style={styles.input} placeholder="School Name" onChange={(e) => setSchoolName(e.target.value)} />
        <input style={styles.input} placeholder="Address" onChange={(e) => setAddress(e.target.value)} />
        <input style={styles.input} placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)} />

        <button style={styles.button} onClick={handleSetup} disabled={loading}>
          {loading ? "Saving..." : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", background: "#020617",
    display: "flex", justifyContent: "center", alignItems: "center",
  },
  card: {
    background: "#0f172a", padding: 36, borderRadius: 18, width: 360,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  title: { color: "#fff", fontSize: 22, textAlign: "center", marginBottom: 24 },
  input: {
    width: "100%", padding: 12, marginBottom: 14, borderRadius: 8,
    border: "1px solid #334155", background: "#1e293b", color: "#fff",
    fontSize: 14, boxSizing: "border-box",
  },
  button: {
    width: "100%", padding: 13, background: "#6366f1", color: "#fff",
    border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 15,
  },
};
