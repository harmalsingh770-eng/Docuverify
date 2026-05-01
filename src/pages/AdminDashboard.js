import { useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AdminDashboard() {

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || user.email !== "your@email.com") {
      window.location.href = "/";
    }
  }, []);

  const approveAll = async () => {
    const snap = await getDocs(collection(db, "schools"));
    snap.forEach(async (d) => {
      await updateDoc(doc(db, "schools", d.id), {
        isApproved: true,
      });
    });
    alert("All approved");
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={approveAll}>Approve Schools</button>
    </div>
  );
}