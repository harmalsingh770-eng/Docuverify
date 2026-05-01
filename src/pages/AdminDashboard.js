"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

import { isAdmin } from "../config/admin";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);

      if (!isAdmin(u)) {
        alert("Access Denied");
        return;
      }

      fetchAll();
    });
  }, []);

  const fetchAll = async () => {
    const schoolSnap = await getDocs(collection(db, "schools"));
    const studentSnap = await getDocs(collection(db, "students"));
    const docsSnap = await getDocs(collection(db, "docs"));

    setSchools(schoolSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setStudents(studentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setDocs(docsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const approveDoc = async (id) => {
    await updateDoc(doc(db, "docs", id), {
      status: "approved"
    });
    fetchAll();
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>👑 Admin Panel</h1>

      <h2>🏫 Schools</h2>
      {schools.map(s => (
        <div key={s.id}>
          {s.schoolName} - {s.status}
        </div>
      ))}

      <h2>👨‍🎓 Students</h2>
      {students.map(s => (
        <div key={s.id}>
          {s.name} ({s.rollNo})
        </div>
      ))}

      <h2>📄 Documents</h2>
      {docs.map(d => (
        <div key={d.id}>
          {d.fileUrl} - {d.status}
          {d.status !== "approved" && (
            <button onClick={() => approveDoc(d.id)}>
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  );
}