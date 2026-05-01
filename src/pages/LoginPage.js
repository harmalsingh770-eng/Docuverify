import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!code || !password) {
      alert("Fill all fields");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏫 School Login</h2>

        <input
          style={styles.input}
          placeholder="School Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>
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
  title: {
    marginBottom: 24,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
  },
};
