import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [schools, setSchools] = useState([]);
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  // 🔐 Protect Admin Route
  useEffect(() => {
    const user = auth.currentUser;

    if (!user || user.email !== "gurnek1911@gmail.com") {
      window.location.href = "/";
    } else {
      fetchData();
    }
  }, []);

  // 📥 Fetch Data
  const fetchData = async () => {
    const schoolSnap = await getDocs(collection(db, "schools"));
    const paymentSnap = await getDocs(collection(db, "payments"));

    setSchools(schoolSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setPayments(paymentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // ✅ Approve School
  const approveSchool = async (id) => {
    await updateDoc(doc(db, "schools", id), {
      isApproved: true,
    });

    alert("School Approved ✅");
    fetchData();
  };

  // 💳 Approve Payment (optional)
  const approvePayment = async (id) => {
    await updateDoc(doc(db, "payments", id), {
      status: "approved",
    });

    alert("Payment Approved 💰");
    fetchData();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚡ Admin Panel</h1>

      <button style={styles.back} onClick={() => navigate("/")}>
        Logout
      </button>

      {/* 🏫 Schools Section */}
      <h2 style={styles.section}>🏫 Schools</h2>

      {schools.map((s) => (
        <div key={s.id} style={styles.card}>
          <p><b>ID:</b> {s.id}</p>
          <p><b>Name:</b> {s.name || "Not set"}</p>
          <p><b>Paid:</b> {s.isPaid ? "✅" : "❌"}</p>
          <p><b>Approved:</b> {s.isApproved ? "✅" : "❌"}</p>

          {!s.isApproved && (
            <button
              style={styles.approve}
              onClick={() => approveSchool(s.id)}
            >
              Approve School
            </button>
          )}
        </div>
      ))}

      {/* 💳 Payments Section */}
      <h2 style={styles.section}>💳 Payments</h2>

      {payments.map((p) => (
        <div key={p.id} style={styles.card}>
          <p><b>School ID:</b> {p.schoolId}</p>
          <p><b>Amount:</b> ₹{p.amount}</p>
          <p><b>Status:</b> {p.status}</p>

          {p.status !== "approved" && (
            <button
              style={styles.approve}
              onClick={() => approvePayment(p.id)}
            >
              Approve Payment
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#020617",
    color: "#fff",
    padding: 30,
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
  },
  section: {
    marginTop: 30,
    marginBottom: 10,
    color: "#94a3b8",
  },
  card: {
    background: "#0f172a",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  approve: {
    marginTop: 10,
    padding: "8px 16px",
    background: "#22c55e",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },
  back: {
    marginBottom: 20,
    padding: "8px 16px",
    background: "#ef4444",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },
};