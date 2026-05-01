import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const email = code + "@school.com";
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch {
      alert("Invalid login");
    }
  };

  const handleSignup = async () => {
    try {
      const email = code + "@school.com";
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "schools", userCred.user.uid), {
        code,
        isPaid: false,
        isApproved: false,
        createdAt: new Date(),
      });

      alert("Account created! Now setup school.");
      navigate("/setup-school");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏫 School Login</h2>

        <input style={styles.input} placeholder="School Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button style={styles.button} onClick={handleLogin}>Login</button>
        <button style={styles.signup} onClick={handleSignup}>Create School Account</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "linear-gradient(135deg, #4facfe, #00f2fe)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: 36,
    borderRadius: 16,
    width: 320,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: { marginBottom: 24 },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    marginBottom: 10,
  },
  signup: {
    width: "100%",
    padding: 10,
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 8,
  },
};