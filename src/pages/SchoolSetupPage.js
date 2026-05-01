import { useState } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SchoolSetupPage() {
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSetup = async () => {
    const user = auth.currentUser;

    await updateDoc(doc(db, "schools", user.uid), {
      name: schoolName,
      address,
      phone,
    });

    navigate("/payment");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏫 Setup Your School</h2>

        <input style={styles.input} placeholder="School Name" onChange={(e) => setSchoolName(e.target.value)} />
        <input style={styles.input} placeholder="Address" onChange={(e) => setAddress(e.target.value)} />
        <input style={styles.input} placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)} />

        <button style={styles.button} onClick={handleSetup}>Save & Continue</button>
      </div>
    </div>
  );
}