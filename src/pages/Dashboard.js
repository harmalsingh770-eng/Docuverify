import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/");

      const snap = await getDoc(doc(db, "schools", user.uid));
      const data = snap.data();

      if (!data?.isPaid) {
        navigate("/payment");
      } else if (!data?.isApproved) {
        alert("Waiting for admin approval");
      }
    };

    checkAccess();
  }, []);

  const cards = [
    { label: "🎓 Students", path: "/students" },
    { label: "📚 Classes", path: "/classes" },
    { label: "📄 Documents", path: "/required-docs" },
    { label: "💳 Payment", path: "/payment" },
    { label: "🔧 Setup School", path: "/setup-school" },
  ];

  return (
    <div style={styles.container}>
      <h1>Dashboard</h1>

      {cards.map((c) => (
        <div key={c.path} onClick={() => navigate(c.path)}>
          {c.label}
        </div>
      ))}
    </div>
  );
}