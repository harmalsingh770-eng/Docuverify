import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, updateDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { isAdmin } from "../config/admin";
import { useNavigate } from "react-router-dom";

const T = {
  bg: "#060b18", surface: "#0d1829", surfaceHigh: "#111f38",
  border: "#152040",
  violet: "#8b5cf6", violetGlow: "rgba(139,92,246,0.15)",
  blue: "#3b82f6", blueGlow: "rgba(59,130,246,0.15)",
  green: "#10b981", greenGlow: "rgba(16,185,129,0.12)",
  amber: "#f59e0b", amberGlow: "rgba(245,158,11,0.12)",
  red: "#f43f5e", redBg: "rgba(244,63,94,0.1)",
  text: "#e2e8f0", textSub: "#94a3b8", textMuted: "#475569",
};

function Spinner({ color = T.violet, size = 20 }) {
  return <div style={{ width: size, height: size, border: `2.5px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "dvSpin 0.7s linear infinite" }} />;
}

function Badge({ children, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: `${color}15`, color, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", border: `1px solid ${color}30` }}>
      {children}
    </span>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "20px", borderTop: `2px solid ${accent}` }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textMuted }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [schools, setSchools] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState("payments"); // payments | schools | students
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById("dv-kf")) {
      const s = document.createElement("style"); s.id = "dv-kf";
      s.textContent = `@keyframes dvSpin{to{transform:rotate(360deg)}}@keyframes dvFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}body{font-family:'Sora',sans-serif;background:#060b18}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#060b18}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}`;
      document.head.appendChild(s);
    }
    if (!document.getElementById("dv-fonts")) {
      const l = document.createElement("link"); l.id = "dv-fonts"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap";
      document.head.appendChild(l);
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { navigate("/admin-login"); return; }
      if (!isAdmin(u)) { alert("Access Denied"); auth.signOut(); navigate("/"); return; }
      setUser(u);
      fetchAll();
    });
    return unsub;
  }, [navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [schoolSnap, paymentSnap, studentSnap] = await Promise.all([
        getDocs(collection(db, "schools")),
        getDocs(collection(db, "payments")),
        getDocs(collection(db, "students")),
      ]);
      setSchools(schoolSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPayments(paymentSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const tb = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return tb - ta;
      }));
      setStudents(studentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const approveSchool = async (schoolId) => {
    setActionLoading(p => ({ ...p, [schoolId]: "approve" }));
    try {
      await updateDoc(doc(db, "schools", schoolId), { isApproved: true });
      await updateDoc(doc(db, "payments", schoolId), { status: "verified" }).catch(() => {});
      fetchAll();
    } catch (e) { alert(e.message); }
    finally { setActionLoading(p => ({ ...p, [schoolId]: null })); }
  };

  const rejectSchool = async (schoolId) => {
    if (!window.confirm("Reject this school? This will mark payment as rejected.")) return;
    setActionLoading(p => ({ ...p, [schoolId]: "reject" }));
    try {
      await updateDoc(doc(db, "schools", schoolId), { isApproved: false, isPaid: false });
      await updateDoc(doc(db, "payments", schoolId), { status: "rejected" }).catch(() => {});
      fetchAll();
    } catch (e) { alert(e.message); }
    finally { setActionLoading(p => ({ ...p, [schoolId]: null })); }
  };

  const pendingPayments = payments.filter(p => p.status === "pending");
  const verifiedPayments = payments.filter(p => p.status === "verified");
  const approvedSchools = schools.filter(s => s.isApproved);
  const pendingSchools = schools.filter(s => !s.isApproved);

  const TABS = [
    { key: "payments", label: "Payment Requests", count: pendingPayments.length, accent: T.amber },
    { key: "schools", label: "Schools", count: schools.length, accent: T.blue },
    { key: "students", label: "Students", count: students.length, accent: T.green },
  ];

  if (!user) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner size={36} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Sora', sans-serif", color: T.text }}>
      {/* ── SIDEBAR / TOPBAR ── */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.violet}20`, border: `1.5px solid ${T.violet}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👑</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Admin Dashboard</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>DocuVerify Platform</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: T.textMuted }}>
            Logged in as <span style={{ color: T.violet }}>{user.email}</span>
          </div>
          <button onClick={() => { auth.signOut(); navigate("/"); }}
            style={{ padding: "7px 14px", background: T.redBg, border: `1px solid ${T.red}30`, color: T.red, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 20px" }}>
        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 30, animation: "dvFadeUp 0.4s ease both" }}>
          <StatCard icon="⏳" label="Pending Payments" value={pendingPayments.length} accent={T.amber} />
          <StatCard icon="✅" label="Approved Schools" value={approvedSchools.length} accent={T.green} />
          <StatCard icon="🏫" label="Total Schools" value={schools.length} accent={T.blue} />
          <StatCard icon="👥" label="Total Students" value={students.length} accent={T.violet} />
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 5 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: "10px 16px", background: tab === t.key ? t.accent : "transparent", color: tab === t.key ? "#fff" : T.textSub, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.18s" }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ minWidth: 20, height: 20, borderRadius: 10, background: tab === t.key ? "rgba(255,255,255,0.25)" : `${t.accent}20`, color: tab === t.key ? "#fff" : t.accent, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={32} /></div>
        ) : (
          <div style={{ animation: "dvFadeUp 0.35s ease both" }}>

            {/* PAYMENTS TAB */}
            {tab === "payments" && (
              <>
                {pendingPayments.length === 0 && verifiedPayments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 15 }}>No payment requests yet.</div>
                  </div>
                ) : (
                  <>
                    {pendingPayments.length > 0 && (
                      <>
                        <div style={{ fontSize: 12, color: T.amber, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>⏳ Pending Review ({pendingPayments.length})</div>
                        {pendingPayments.map(p => {
                          const school = schools.find(s => s.id === p.schoolId) || {};
                          return (
                            <div key={p.id} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderLeft: `3px solid ${T.amber}`, borderRadius: 14, padding: "20px 22px", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 16 }}>🏫</span>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{p.schoolName || school.name || "Unnamed School"}</span>
                                    <Badge color={T.amber}>Pending</Badge>
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                                    <div style={{ fontSize: 12, color: T.textMuted }}>Amount: <span style={{ color: T.green, fontWeight: 700 }}>₹{p.amount}</span></div>
                                    <div style={{ fontSize: 12, color: T.textMuted }}>Email: <span style={{ color: T.textSub }}>{school.email || p.schoolId}</span></div>
                                    <div style={{ fontSize: 12, color: T.textMuted }}>
                                      UPI ID: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: T.text, fontSize: 11 }}>{p.upiTransactionId || "Not provided"}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: T.textMuted }}>
                                      Date: <span style={{ color: T.textSub }}>{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString("en-IN") : new Date(p.createdAt).toLocaleDateString("en-IN")}</span>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                  <button
                                    onClick={() => approveSchool(p.schoolId)}
                                    disabled={!!actionLoading[p.schoolId]}
                                    style={{ padding: "9px 18px", background: T.green, color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                                    {actionLoading[p.schoolId] === "approve" ? <Spinner size={14} color="#fff" /> : "✓"} Approve
                                  </button>
                                  <button
                                    onClick={() => rejectSchool(p.schoolId)}
                                    disabled={!!actionLoading[p.schoolId]}
                                    style={{ padding: "9px 18px", background: T.redBg, border: `1px solid ${T.red}30`, color: T.red, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                                    ✕ Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {verifiedPayments.length > 0 && (
                      <>
                        <div style={{ fontSize: 12, color: T.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, marginTop: 24 }}>✅ Verified ({verifiedPayments.length})</div>
                        {verifiedPayments.map(p => {
                          const school = schools.find(s => s.id === p.schoolId) || {};
                          return (
                            <div key={p.id} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderLeft: `3px solid ${T.green}`, borderRadius: 14, padding: "16px 22px", marginBottom: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 15 }}>🏫</span>
                                  <span style={{ fontSize: 15, fontWeight: 700 }}>{p.schoolName || school.name || "School"}</span>
                                  <Badge color={T.green}>Verified</Badge>
                                </div>
                                <div style={{ fontSize: 12, color: T.textMuted }}>
                                  UPI: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: T.textSub, fontSize: 11 }}>{p.upiTransactionId}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* SCHOOLS TAB */}
            {tab === "schools" && (
              <>
                {pendingSchools.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, color: T.amber, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>⏳ Pending Approval ({pendingSchools.length})</div>
                    {pendingSchools.map(s => (
                      <div key={s.id} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderLeft: `3px solid ${T.amber}`, borderRadius: 14, padding: "18px 22px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 16, fontWeight: 700 }}>{s.name || "Unnamed School"}</span>
                            <Badge color={s.isPaid ? T.blue : T.red}>{s.isPaid ? "Paid" : "Unpaid"}</Badge>
                          </div>
                          <div style={{ fontSize: 12, color: T.textMuted }}>{s.email} {s.code && <span>· Code: <span style={{ fontFamily: "'JetBrains Mono',monospace", color: T.textSub }}>{s.code}</span></span>}</div>
                        </div>
                        {s.isPaid && (
                          <button onClick={() => approveSchool(s.id)} disabled={!!actionLoading[s.id]}
                            style={{ padding: "9px 18px", background: T.green, color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                            {actionLoading[s.id] === "approve" ? <Spinner size={14} color="#fff" /> : "✓"} Approve
                          </button>
                        )}
                      </div>
                    ))}
                    <div style={{ height: 1, background: T.border, margin: "20px 0" }} />
                  </>
                )}

                <div style={{ fontSize: 12, color: T.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>✅ Approved Schools ({approvedSchools.length})</div>
                {approvedSchools.length === 0 && <p style={{ color: T.textMuted, fontSize: 14 }}>No approved schools yet.</p>}
                {approvedSchools.map(s => (
                  <div key={s.id} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderLeft: `3px solid ${T.green}`, borderRadius: 14, padding: "16px 22px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{s.name || "Unnamed"}</span>
                        <Badge color={T.green}>Approved</Badge>
                      </div>
                      <div style={{ fontSize: 12, color: T.textMuted }}>{s.email}</div>
                    </div>
                    {s.code && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: T.blue, fontWeight: 600 }}>{s.code}</span>}
                  </div>
                ))}
              </>
            )}

            {/* STUDENTS TAB */}
            {tab === "students" && (
              <>
                {students.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                    <div style={{ fontSize: 15 }}>No students registered yet.</div>
                  </div>
                ) : students.map(s => (
                  <div key={s.id} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "16px 22px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${T.violet}18`, border: `1px solid ${T.violet}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name || "Unknown"}</div>
                        <div style={{ fontSize: 12, color: T.textMuted }}>Roll: {s.rollNo || "N/A"}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: T.textSub }}>School: {s.schoolId?.slice(0, 8)}…</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
