import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { isAdmin } from "../config/admin";

const T = {
  bg: "#060b18", surface: "#0d1829",
  border: "#152040", borderFocus: "#8b5cf6",
  violet: "#8b5cf6", violetGlow: "rgba(139,92,246,0.18)",
  red: "#f43f5e", redBg: "rgba(244,63,94,0.1)",
  text: "#e2e8f0", textSub: "#94a3b8", textMuted: "#475569",
};

function Spinner({ color = "#fff", size = 18 }) {
  return <div style={{ width: size, height: size, border: `2.5px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "dvSpin 0.7s linear infinite", display: "inline-block" }} />;
}

function Field({ label, type = "text", value, onChange, placeholder, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textSub, marginBottom: 7 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: focused ? T.violet : T.textMuted, pointerEvents: "none" }}>{icon}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", padding: `13px 14px 13px ${icon ? "42px" : "14px"}`, background: "#07101f", border: `1.5px solid ${focused ? T.borderFocus : T.border}`, borderRadius: 10, color: T.text, fontSize: 14, fontFamily: "'Sora', sans-serif", outline: "none", boxShadow: focused ? `0 0 0 3px ${T.violetGlow}` : "none", transition: "border-color 0.2s, box-shadow 0.2s" }} />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!document.getElementById("dv-kf")) {
      const s = document.createElement("style"); s.id = "dv-kf";
      s.textContent = `@keyframes dvSpin{to{transform:rotate(360deg)}}@keyframes dvFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}body{font-family:'Sora',sans-serif;background:#060b18}input{font-family:'Sora',sans-serif}input:-webkit-autofill{-webkit-box-shadow:0 0 0 40px #07101f inset!important;-webkit-text-fill-color:#e2e8f0!important}`;
      document.head.appendChild(s);
    }
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) { setErr("Please fill in both fields."); return; }
    setLoading(true); setErr("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!isAdmin(cred.user)) {
        await auth.signOut();
        setErr("Access denied. This is the admin portal only.");
        setLoading(false); return;
      }
      navigate("/admin");
    } catch {
      setErr("Invalid admin credentials. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "'Sora', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* bg orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-15%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.violetGlow} 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-15%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, animation: "dvFadeUp 0.42s cubic-bezier(.22,.68,0,1.2) both" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.textSub, textDecoration: "none", marginBottom: 24 }}>← Back to home</Link>

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: `${T.violet}18`, border: `1.5px solid ${T.violet}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>👑</div>
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Restricted Access</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1 }}>Admin Portal</h1>
          </div>
        </div>

        {/* warning */}
        <div style={{ background: `${T.violet}0d`, border: `1px solid ${T.violet}25`, borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6, margin: 0 }}>
            This portal is for DocuVerify platform administrators only. Unauthorized access attempts are logged.
          </p>
        </div>

        {/* card */}
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: "28px 26px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
          {err && <div style={{ background: T.redBg, border: `1px solid ${T.red}30`, borderRadius: 10, padding: "11px 14px", marginBottom: 18, fontSize: 13, color: T.red }}>⚠ {err}</div>}

          <Field label="Admin Email" type="email" value={email} onChange={setEmail} placeholder="admin@docuverify.com" icon="✉️" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Admin password" icon="🔒" />

          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "13px", background: loading ? `${T.violet}80` : T.violet, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.18s", boxShadow: !loading ? `0 4px 20px ${T.violetGlow}` : "none" }}>
            {loading ? <><Spinner />Verifying…</> : "👑 Login as Admin →"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: T.textMuted, marginTop: 18 }}>
          Not an admin?{" "}
          <Link to="/" style={{ color: T.violet, textDecoration: "none" }}>Go back to home</Link>
        </p>
      </div>
    </div>
  );
}
