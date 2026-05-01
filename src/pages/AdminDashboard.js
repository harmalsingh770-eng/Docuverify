import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

export default function AdminDashboard() {
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState({});
  const [selectedSchool, setSelectedSchool] = useState(null);

  // 🔐 Protect admin
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || user.email !== "gurnek1911@gmail.com") {
      window.location.href = "/";
    } else {
      fetchSchools();
    }
  }, []);

  // 🏫 Fetch schools
  const fetchSchools = async () => {
    const snap = await getDocs(collection(db, "schools"));
    setSchools(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // 👨‍🎓 Fetch students of selected school
  const fetchStudents = async (schoolId) => {
    const snap = await getDocs(collection(db, "schools", schoolId, "students"));

    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setStudents(prev => ({ ...prev, [schoolId]: data }));
    setSelectedSchool(schoolId);
  };

  // ✅ Approve school
  const approveSchool = async (id) => {
    await updateDoc(doc(db, "schools", id), {
      isApproved: true,
    });
    fetchSchools();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚡ Admin Panel</h1>

      {/* 🏫 Schools */}
      <h2 style={styles.section}>🏫 Schools</h2>

      {schools.map((s) => (
        <div key={s.id} style={styles.card}>
          <p><b>Name:</b> {s.name || "Not set"}</p>
          <p><b>Paid:</b> {s.isPaid ? "✅" : "❌"}</p>
          <p><b>Approved:</b> {s.isApproved ? "✅" : "❌"}</p>

          {!s.isApproved && (
            <button
              style={styles.approve}
              onClick={() => approveSchool(s.id)}
            >
              Approve
            </button>
          )}

          <button
            style={styles.view}
            onClick={() => fetchStudents(s.id)}
          >
            View Students
          </button>
        </div>
      ))}

      {/* 👨‍🎓 Students View */}
      {selectedSchool && (
        <div style={styles.studentSection}>
          <h2>👨‍🎓 Students of {selectedSchool}</h2>

          {(students[selectedSchool] || []).map((st) => (
            <div key={st.id} style={styles.studentCard}>
              <p><b>Name:</b> {st.name}</p>
              <p><b>Class:</b> {st.class}</p>
              <p><b>Roll No:</b> {st.rollNo}</p>
            </div>
          ))}
        </div>
      )}
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
  title: { fontSize: 30 },
  section: { marginTop: 30, color: "#94a3b8" },
  card: {
    background: "#0f172a",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  approve: {
    marginTop: 10,
    marginRight: 10,
    background: "#22c55e",
    border: "none",
    padding: "6px 12px",
    color: "#fff",
    borderRadius: 6,
  },
  view: {
    background: "#6366f1",
    border: "none",
    padding: "6px 12px",
    color: "#fff",
    borderRadius: 6,
  },
  studentSection: {
    marginTop: 40,
    background: "#020617",
    padding: 20,
  },
  studentCard: {
    background: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
};