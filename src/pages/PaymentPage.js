import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // FIX: auth.currentUser may be null — wait for auth state
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { navigate("/"); return; }
      setUser(u);
    });
    return unsub;
  }, [navigate]);

  const handlePayment = async () => {
    if (!user) return;

    try {
      await setDoc(doc(db, "payments", user.uid), {
        schoolId: user.uid,
        amount: 799,
        status: "pending",
        createdAt: new Date(),
      });

      await updateDoc(doc(db, "schools", user.uid), {
        isPaid: true,
      });

      alert("Payment submitted! Waiting for admin approval.");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Unlock Your School</h2>
        <p style={styles.price}>₹799</p>
        <p style={styles.desc}>One-time fee to manage students, classes & documents</p>

        <button style={styles.button} onClick={handlePayment}>
          Pay Now
        </button>

        <p style={styles.note}>* Demo payment. Admin will approve manually.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", background: "#0f172a",
    display: "flex", justifyContent: "center", alignItems: "center",
  },
  card: {
    background: "#1e293b", padding: 40, borderRadius: 18,
    width: 340, textAlign: "center", color: "#fff",
  },
  title: { fontSize: 24, marginBottom: 16 },
  price: { fontSize: 40, color: "#22c55e", fontWeight: "bold", margin: "10px 0" },
  desc: { color: "#94a3b8", marginBottom: 30, fontSize: 14 },
  button: {
    width: "100%", padding: 14, background: "#6366f1",
    color: "#fff", border: "none", borderRadius: 10,
    cursor: "pointer", fontWeight: "bold", fontSize: 16, marginBottom: 16,
  },
  note: { color: "#475569", fontSize: 12 },
};
