import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const T = {
  bg: "#060b18", surface: "#0d1829", surfaceHigh: "#111f38",
  border: "#152040", borderFocus: "#3b82f6",
  blue: "#3b82f6", blueGlow: "rgba(59,130,246,0.18)",
  green: "#10b981", greenGlow: "rgba(16,185,129,0.15)",
  amber: "#f59e0b", amberGlow: "rgba(245,158,11,0.12)",
  red: "#f43f5e", redBg: "rgba(244,63,94,0.1)",
  text: "#e2e8f0", textSub: "#94a3b8", textMuted: "#475569",
};

function Spinner({ color = "#fff", size = 18 }) {
  return <div style={{ width: size, height: size, border: `2.5px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "dvSpin 0.7s linear infinite", display: "inline-block" }} />;
}

function Field({ label, value, onChange, placeholder, icon, hint, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textSub, marginBottom: 7 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: focused ? T.blue : T.textMuted, pointerEvents: "none" }}>{icon}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", padding: `13px 14px 13px ${icon ? "42px" : "14px"}`, background: "#07101f", border: `1.5px solid ${focused ? T.borderFocus : T.border}`, borderRadius: 10, color: T.text, fontSize: 14, fontFamily: "'Sora', sans-serif", outline: "none", boxShadow: focused ? `0 0 0 3px ${T.blueGlow}` : "none", transition: "border-color 0.2s, box-shadow 0.2s" }} />
      </div>
      {hint && <p style={{ fontSize: 12, color: T.textMuted, marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const UPI_ID = "schooldocs@upi"; // ← replace with real UPI ID

  useEffect(() => {
    if (!document.getElementById("dv-kf")) {
      const s = document.createElement("style"); s.id = "dv-kf";
      s.textContent = `@keyframes dvSpin{to{transform:rotate(360deg)}}@keyframes dvFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes dvCheckIn{from{transform:scale(0) rotate(-30deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}body{font-family:'Sora',sans-serif;background:#060b18}input{font-family:'Sora',sans-serif}input:-webkit-autofill{-webkit-box-shadow:0 0 0 40px #07101f inset!important;-webkit-text-fill-color:#e2e8f0!important}`;
      document.head.appendChild(s);
    }
    if (!document.getElementById("dv-fonts")) {
      const l = document.createElement("link"); l.id = "dv-fonts"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap";
      document.head.appendChild(l);
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { navigate("/login?role=school"); return; }
      setUser(u);
    });
    return unsub;
  }, [navigate]);

  const copyUPI = () => {
    navigator.clipboard?.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!schoolName.trim()) { setErr("Please enter your school name."); return; }
    if (!upiRef.trim() || upiRef.trim().length < 6) { setErr("Please enter a valid UPI transaction ID."); return; }
    if (!user) return;
    setErr(""); setLoading(true);
    try {
      await setDoc(doc(db, "payments", user.uid), {
        schoolId: user.uid,
        schoolName: schoolName.trim(),
        upiTransactionId: upiRef.trim(),
        amount: 799,
        status: "pending",
        createdAt: new Date(),
      });
      await updateDoc(doc(db, "schools", user.uid), {
        isPaid: true,
        name: schoolName.trim(),
        paymentStatus: "pending_verification",
      });
      setDone(true);
    } catch (ex) {
      setErr(ex.message);
    } finally { setLoading(false); }
  };

  const features = [
    "Unlimited students & classes",
    "AI-assisted document verification",
    "Firebase secure cloud storage",
    "Teacher & student dashboards",
    "Admin approval within 24 hours",
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px", fontFamily: "'Sora', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* bg orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-15%", width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${T.blueGlow} 0%, transparent 65%)` }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 460, animation: "dvFadeUp 0.42s cubic-bezier(.22,.68,0,1.2) both" }}>

        {done ? (
          /* ── SUCCESS STATE ── */
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: "40px 32px", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: 60, marginBottom: 16, animation: "dvCheckIn 0.5s ease both" }}>🎉</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 10 }}>Request Submitted!</h2>
            <p style={{ color: T.textSub, fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Your payment request has been sent to the admin. You'll receive approval within 24 hours. Once approved, you can start using your school dashboard.
            </p>
            <div style={{ background: "#07101f", border: `1px solid ${T.green}30`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>What happens next</div>
              {["Admin reviews your UPI transaction", "School gets approved (within 24 hrs)", "You get full access to your dashboard"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${T.green}18`, border: `1px solid ${T.green}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.green, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: T.textSub }}>{s}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/dashboard")}
              style={{ width: "100%", padding: "13px", background: T.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
              Go to Dashboard →
            </button>
          </div>
        ) : (
          /* ── PAYMENT FORM ── */
          <>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: T.textSub, cursor: "pointer", fontSize: 13, marginBottom: 22, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Sora', sans-serif" }}>← Back</button>

            {/* header */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 40, background: `${T.green}12`, border: `1px solid ${T.green}30`, fontSize: 11, color: T.green, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} />
                Activate Your School
              </div>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: T.text, lineHeight: 1.15, marginBottom: 8 }}>Unlock All Features</h1>
              <p style={{ color: T.textSub, fontSize: 14, lineHeight: 1.6 }}>Pay ₹799 via UPI, enter your transaction details below, and our admin will approve your school within 24 hours.</p>
            </div>

            {/* price + features */}
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: "24px 26px", marginBottom: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
              {/* price */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>Annual Plan</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontSize: 18, color: T.textSub }}>₹</span>
                    <span style={{ fontSize: 46, fontWeight: 800, color: T.text, lineHeight: 1 }}>799</span>
                    <span style={{ fontSize: 13, color: T.textSub }}>/year</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>One-time • No hidden fees</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: `${T.green}15`, border: `1px solid ${T.green}30`, fontSize: 11, color: T.green, fontWeight: 700 }}>✓ Lifetime</div>
                </div>
              </div>

              {/* features */}
              <div style={{ marginBottom: 24 }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < features.length - 1 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${T.green}18`, border: `1px solid ${T.green}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.green, flexShrink: 0 }}>✓</div>
                    <span style={{ fontSize: 13, color: T.textSub }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* UPI ID box */}
              <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.06))", border: `1.5px solid ${T.blue}30`, borderRadius: 14, padding: "18px 20px", marginBottom: 22 }}>
                <div style={{ fontSize: 11, color: T.blue, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Step 1 — Pay via UPI</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>UPI ID</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 600, color: T.text, letterSpacing: "0.04em" }}>{UPI_ID}</div>
                  </div>
                  <button onClick={copyUPI}
                    style={{ padding: "8px 16px", background: copied ? `${T.green}20` : `${T.blue}18`, border: `1px solid ${copied ? T.green : T.blue}35`, borderRadius: 8, color: copied ? T.green : T.blue, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                    {copied ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 10, lineHeight: 1.5 }}>
                  Open any UPI app (PhonePe, GPay, Paytm), pay ₹799 to this ID, then fill the form below.
                </p>
              </div>

              {/* form */}
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                <div style={{ fontSize: 11, color: T.blue, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Step 2 — Submit Your Details</div>

                {err && <div style={{ background: T.redBg, border: `1px solid ${T.red}30`, borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: T.red }}>⚠ {err}</div>}

                <Field label="School Name" value={schoolName} onChange={setSchoolName} placeholder="e.g. Springdale Public School" icon="🏫" hint="This name will appear on your school dashboard" />
                <Field label="UPI Transaction ID" value={upiRef} onChange={setUpiRef} placeholder="e.g. T2412031234567890" icon="💳" hint="Copy the transaction ID from your UPI app after payment" />

                <button onClick={handleSubmit} disabled={loading}
                  style={{ width: "100%", padding: "14px", background: loading ? `${T.green}80` : T.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.18s" }}>
                  {loading ? <><Spinner />Submitting…</> : "✓ Submit Payment Request"}
                </button>

                <p style={{ textAlign: "center", fontSize: 11, color: T.textMuted, marginTop: 12 }}>
                  🔒 Your details are securely stored · Admin reviews within 24 hours
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
