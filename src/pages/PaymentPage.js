import { db, auth } from "../firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { COLORS } from "../styles/theme";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in.");
        return;
      }

      await setDoc(doc(db, "payments", user.uid), {
        schoolId: user.uid,
        amount: 799,
        status: "pending",
        createdAt: new Date(),
      });

      await updateDoc(doc(db, "schools", user.uid), {
        status: "pending",
      });

      alert("Payment submitted! Wait for admin approval.");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ ...styles.container, backgroundColor: COLORS.bg }}>
      <button style={styles.back} onClick={() => navigate("/dashboard")}>← Back</button>

      <h2 style={{ color: COLORS.text, fontSize: 26, marginBottom: 20 }}>
        Unlock Your School
      </h2>

      <div style={{ ...styles.card, backgroundColor: COLORS.card }}>
        <p style={styles.price}>₹799</p>
        <p style={{ color: COLORS.subText, textAlign: "center", marginTop: 10 }}>
          One-time access to manage students, documents & AI verification
        </p>
      </div>

      <button
        style={{ ...styles.button, backgroundColor: COLORS.primary }}
        onClick={handlePayment}
      >
        Pay Now
      </button>

      <p style={styles.note}>
        * Demo payment. Admin will manually approve your account.
      </p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  back: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 30,
    alignSelf: "flex-start",
  },
  card: {
    padding: 28,
    borderRadius: 16,
    textAlign: "center",
    width: "100%",
    maxWidth: 360,
    marginBottom: 28,
  },
  price: {
    color: "#22c55e",
    fontSize: 36,
    fontWeight: "bold",
    margin: 0,
  },
  button: {
    padding: "16px 50px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
  },
  note: {
    color: "#888",
    marginTop: 14,
    fontSize: 13,
    textAlign: "center",
  },
};
