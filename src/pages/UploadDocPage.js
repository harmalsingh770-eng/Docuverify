import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";

export default function UploadDocPage() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = location.state || {};

  const handleUpload = async () => {
    if (!name || !url) {
      alert("Fill all fields");
      return;
    }
    try {
      await addDoc(collection(db, "students", studentId, "docs"), {
        name,
        url,
        status: "pending",
        createdAt: new Date(),
      });
      alert("Document submitted successfully!");
      navigate(-1);
    } catch (err) {
      alert("Error uploading document");
      console.log(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📎 Upload Document</h2>

        <input
          style={styles.input}
          placeholder="Document Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Paste Google Drive Link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button style={styles.button} onClick={handleUpload}>
          Submit
        </button>

        <button style={styles.cancel} onClick={() => navigate(-1)}>
          Cancel
        </button>

        <div style={styles.guide}>
          <p style={{ fontWeight: "bold", marginBottom: 6 }}>How to upload:</p>
          <ol style={{ textAlign: "left", paddingLeft: 18, margin: 0 }}>
            <li>Upload file to Google Drive</li>
            <li>Click "Share"</li>
            <li>Select "Anyone with link"</li>
            <li>Copy link & paste above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: 36,
    borderRadius: 16,
    width: 360,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  title: { textAlign: "center", marginBottom: 20, color: "#333" },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 14,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: 10,
  },
  cancel: {
    width: "100%",
    padding: 10,
    background: "transparent",
    color: "#888",
    border: "1px solid #ccc",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 20,
  },
  guide: {
    fontSize: 13,
    color: "#555",
    background: "#f8f8f8",
    padding: 14,
    borderRadius: 8,
  },
};
