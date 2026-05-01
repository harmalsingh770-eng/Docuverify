import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const T = {
  bg: "#060b18", surface: "#0d1829", surfaceHigh: "#111f38",
  border: "#152040", borderFocus: "#3b82f6",
  blue: "#3b82f6", blueGlow: "rgba(59,130,246,0.18)",
  green: "#10b981", greenGlow: "rgba(16,185,129,0.15)",
  amber: "#f59e0b", amberGlow: "rgba(245,158,11,0.14)",
  red: "#f43f5e", redBg: "rgba(244,63,94,0.1)",
  text: "#e2e8f0", textSub: "#94a3b8", textMuted: "#475569",
};

const ROLE_CFG = {
  school: { label: "School Admin", emoji: "🏛️", accent: T.blue, glow: T.blueGlow, showCreate: true, description: "Login or register your school account" },
  teacher: { label: "Teacher", emoji: "👩‍🏫", accent: T.green, glow: T.greenGlow, showCreate: false, description: "Sign in with your school name & password" },
  student: { label: "Student", emoji: "🎒", accent: T.amber, glow: T.amberGlow, showCreate: false, description: "Login with your school code & roll number" },
};

function Spinner({ color = "#fff", size = 18 }) {
  return <div style={{ width: size, height: size, border: `2.5px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "dvSpin 0.7s linear infinite", display: "inline-block" }} />;
}

function Field({ label, type = "text", value, onChange, placeholder, icon, error, hint, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textSub, marginBottom: 7 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: focused ? T.blue : T.textMuted, transition: "color 0.2s", pointerEvents: "none" }}>{icon}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", padding: `13px 14px 13px ${icon ? "42px" : "14px"}`, background: T.surface, border: `1.5px solid ${error ? T.red : focused ? T.borderFocus : T.border}`, borderRadius: 10, color: T.text, fontSize: 14, fontFamily: "'Sora', sans-serif", outline: "none", boxShadow: focused ? `0 0 0 3px ${error ? "rgba(244,63,94,0.12)" : T.blueGlow}` : "none", transition: "border-color 0.2s, box-shadow 0.2s" }} />
      </div>
      {error && <p style={{ fontSize: 12, color: T.red, marginTop: 5 }}>⚠ {error}</p>}
      {hint && !error && <p style={{ fontSize: 12, color: T.textMuted, marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

function Btn({ children, onClick, full, loading, disabled, accent }) {
  const [hov, setHov] = useState(false);
  const col = accent || T.blue;
  return (
    <button onClick={onClick} disabled={disabled || loading} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : "auto", padding: "13px 22px", background: hov ? `${col}ee` : col, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: disabled || loading ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, boxShadow: hov ? `0 4px 20px ${col}35` : "none", transition: "all 0.18s ease" }}>
      {loading ? <Spinner /> : children}
    </button>
  );
}

function GBtn({ children, onClick, loading }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={loading} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px 22px", background: hov ? "#f1f5f9" : "#ffffff", color: "#1e293b", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", transition: "all 0.18s ease" }}>
      {loading ? <Spinner color={T.blue} /> : (
        <><svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.2 6.9 29.4 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.7 16.4 19 14 24 14c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.2 6.9 29.4 5 24 5 16.3 5 9.7 9.1 6.3 15.2z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.8 13.5-4.7l-6.2-5.2C29.5 36.9 26.9 38 24 38c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 40.8 16.2 45 24 45z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.4l6.2 5.2C39 36.6 44 31 44 25c0-1.3-.1-2.6-.4-3.9z"/></svg>{children}</>
      )}
    </button>
  );
}

function SchoolForm({ navigate }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [err, setErr] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleLogin = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setErr("");
    try { await signInWithEmailAndPassword(auth, email, password); navigate("/dashboard"); }
    catch { setErr("Invalid email or password."); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "schools", cred.user.uid), { email, isPaid: false, isApproved: false, createdAt: new Date() });
      navigate("/setup-school");
    } catch (ex) {
      setErr(ex.code === "auth/email-already-in-use" ? "Account already exists. Try logging in." : ex.message);
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGLoading(true); setErr("");
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const snap = await getDoc(doc(db, "schools", cred.user.uid));
      if (snap.exists()) {
        const d = snap.data();
        if (!d.isPaid) { navigate("/payment"); return; }
        navigate("/dashboard");
      } else {
        await setDoc(doc(db, "schools", cred.user.uid), { email: cred.user.email, isPaid: false, isApproved: false, createdAt: new Date() });
        navigate("/setup-school");
      }
    } catch { setErr("Google sign-in failed. Try again."); }
    finally { setGLoading(false); }
  };

  return (
    <>
      <div style={{ display: "flex", background: "#07101f", border: `1px solid ${T.border}`, borderRadius: 10, padding: 4, marginBottom: 26 }}>
        {["login","register"].map(m => (
          <button key={m} onClick={() => { setMode(m); setErr(""); setErrors({}); }}
            style={{ flex: 1, padding: "9px 0", background: mode === m ? T.blue : "transparent", color: mode === m ? "#fff" : T.textSub, border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", transition: "all 0.18s" }}>
            {m === "login" ? "Login" : "Create Account"}
          </button>
        ))}
      </div>

      {err && <div style={{ background: T.redBg, border: `1px solid ${T.red}30`, borderRadius: 10, padding: "11px 14px", marginBottom: 18, fontSize: 13, color: T.red }}>⚠ {err}</div>}

      <GBtn loading={gLoading} onClick={handleGoogle}>Continue with Google</GBtn>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: T.border }} />
        <span style={{ fontSize: 11, color: T.textMuted }}>or use email</span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
      </div>

      <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="principal@yourschool.com" icon="✉️" error={errors.email} autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 6 characters" icon="🔒" error={errors.password} autoComplete={mode === "login" ? "current-password" : "new-password"} hint={mode === "register" ? "You'll use this to manage your school" : ""} />

      <Btn full loading={loading} accent={T.blue} onClick={mode === "login" ? handleLogin : handleRegister}>
        {mode === "login" ? "Login to Dashboard →" : "Create School Account →"}
      </Btn>
      {mode === "register" && <p style={{ fontSize: 12, color: T.textMuted, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>After creating your account you'll set up your school profile then pay ₹799 to activate.</p>}
    </>
  );
}

function TeacherForm({ navigate }) {
  const [schoolName, setSchoolName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async () => {
    if (!schoolName.trim() || !password) { setErr("Please fill in both fields."); return; }
    setLoading(true); setErr("");
    try {
      const q = query(collection(db, "schools"), where("name", "==", schoolName.trim()));
      const snap = await getDocs(q);
      if (snap.empty) { setErr("No school found with that name."); setLoading(false); return; }
      const sd = snap.docs[0].data();
      if (!sd.isApproved) { setErr("This school is pending admin approval."); setLoading(false); return; }
      const email = (sd.code || snap.docs[0].id) + "@teacher.docuverify.com";
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch { setErr("Invalid school name or password."); }
    finally { setLoading(false); }
  };

  return (
    <>
      {err && <div style={{ background: T.redBg, border: `1px solid ${T.red}30`, borderRadius: 10, padding: "11px 14px", marginBottom: 18, fontSize: 13, color: T.red }}>⚠ {err}</div>}
      <div style={{ background: `${T.green}0d`, border: `1px solid ${T.green}25`, borderRadius: 10, padding: "12px 14px", marginBottom: 22, fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>
        💡 Your school admin provides the school name and password. Contact them if needed.
      </div>
      <Field label="School Name" value={schoolName} onChange={setSchoolName} placeholder="e.g. Springdale Public School" icon="🏫" />
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="School password" icon="🔒" autoComplete="current-password" />
      <Btn full loading={loading} accent={T.green} onClick={handleLogin}>Login as Teacher →</Btn>
    </>
  );
}

function StudentForm({ navigate }) {
  const [schoolCode, setSchoolCode] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async () => {
    if (!schoolCode.trim() || !rollNo.trim() || !password) { setErr("All fields are required."); return; }
    setLoading(true); setErr("");
    try {
      const email = `${rollNo.trim()}@${schoolCode.trim().toLowerCase()}.student.docuverify.com`;
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/upload-doc");
    } catch { setErr("Invalid school code, roll number, or password."); }
    finally { setLoading(false); }
  };

  return (
    <>
      {err && <div style={{ background: T.redBg, border: `1px solid ${T.red}30`, borderRadius: 10, padding: "11px 14px", marginBottom: 18, fontSize: 13, color: T.red }}>⚠ {err}</div>}
      <div style={{ background: `${T.amber}0d`, border: `1px solid ${T.amber}25`, borderRadius: 10, padding: "12px 14px", marginBottom: 22, fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>
        🎒 Your teacher will give you the school code and your login password.
      </div>
      <Field label="School Code" value={schoolCode} onChange={setSchoolCode} placeholder="e.g. SPRI2024" icon="🏫" hint="Code given by your school" />
      <Field label="Roll Number" value={rollNo} onChange={setRollNo} placeholder="e.g. 42" icon="🎫" />
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Password given by teacher" icon="🔒" autoComplete="current-password" />
      <Btn full loading={loading} accent={T.amber} onClick={handleLogin}>Login as Student →</Btn>
    </>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "school";
  const cfg = ROLE_CFG[role] || ROLE_CFG.school;

  useEffect(() => {
    if (!document.getElementById("dv-fonts")) {
      const l = document.createElement("link"); l.id = "dv-fonts"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap";
      document.head.appendChild(l);
    }
    if (!document.getElementById("dv-kf")) {
      const s = document.createElement("style"); s.id = "dv-kf";
      s.textContent = `@keyframes dvSpin{to{transform:rotate(360deg)}}@keyframes dvFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}body{font-family:'Sora',sans-serif;background:#060b18}input{font-family:'Sora',sans-serif}input:-webkit-autofill{-webkit-box-shadow:0 0 0 40px #0d1829 inset!important;-webkit-text-fill-color:#e2e8f0!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#060b18}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}`;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", position: "relative", overflow: "hidden", fontFamily: "'Sora', sans-serif" }}>
      {/* bg orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-15%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-15%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,0.05) 0%, transparent 65%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, animation: "dvFadeUp 0.42s cubic-bezier(.22,.68,0,1.2) both" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.textSub, textDecoration: "none", marginBottom: 24 }}>← Back to home</Link>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${cfg.accent}18`, border: `1.5px solid ${cfg.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{cfg.emoji}</div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Sign in as</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1 }}>{cfg.label}</h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>{cfg.description}</p>
        </div>

        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: "28px 26px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
          {role === "school" && <SchoolForm navigate={navigate} />}
          {role === "teacher" && <TeacherForm navigate={navigate} />}
          {role === "student" && <StudentForm navigate={navigate} />}
        </div>

        {/* role switcher */}
        <div style={{ marginTop: 16, padding: "14px 18px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>Not your role?</span>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(ROLE_CFG).filter(([k]) => k !== role).map(([k, v]) => (
              <button key={k} onClick={() => navigate(`/login?role=${k}`)}
                style={{ padding: "5px 12px", borderRadius: 20, background: `${v.accent}15`, border: `1px solid ${v.accent}30`, color: v.accent, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                {v.emoji} {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
