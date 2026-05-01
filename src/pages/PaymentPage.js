import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const navigate = useNavigate();

  const handlePayment = async () => {
    const user = auth.currentUser;

    await setDoc(doc(db, "payments", user.uid), {
      schoolId: user.uid,
      amount: 799,
      status: "pending",
      createdAt: new Date(),
    });

    await updateDoc(doc(db, "schools", user.uid), {
      isPaid: true,
    });

    alert("Payment submitted! Wait for approval");
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <h2>Unlock Your School</h2>
      <h1 style={{ color: "green" }}>₹799</h1>

      <button style={styles.button} onClick={handlePayment}>
        Pay Now
      </button>
    </div>
  );
}