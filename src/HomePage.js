import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── inject fonts ── */
if (!document.getElementById("dv-fonts")) {
  const l = document.createElement("link");
  l.id = "dv-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap";
  document.head.appendChild(l);
}

/* ── global styles ── */
if (!document.getElementById("dv-global")) {
  const s = document.createElement("style");
  s.id = "dv-global";
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Sora', sans-serif; background: #060b18; color: #e2e8f0; }

    @keyframes dvFadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes dvFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33%       { transform: translateY(-10px) rotate(1deg); }
      66%       { transform: translateY(5px) rotate(-1deg); }
    }
    @keyframes dvGlow {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }
    @keyframes dvSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes dvSlideIn {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .dv-card-hover {
      transition: transform 0.22s cubic-bezier(.22,.68,0,1.2),
                  box-shadow 0.22s ease,
                  border-color 0.22s ease;
    }
    .dv-card-hover:hover {
      transform: translateY(-4px) scale(1.015);
    }

    .dv-btn-hover {
      transition: all 0.18s ease;
    }
    .dv-btn-hover:hover { filter: brightness(1.12); transform: translateY(-1px); }
    .dv-btn-hover:active { transform: scale(0.97); }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #060b18; }
    ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }

    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 40px #0d1829 inset !important;
      -webkit-text-fill-color: #e2e8f0 !important;
    }
  `;
  document.head.appendChild(s);
}

/* ── token colours ── */
const T = {
  bg: "#060b18",
  surface: "#0d1829",
  border: "#152040",
  borderHover: "#1e3a5f",

  blue: "#3b82f6",
  blueGlow: "rgba(59,130,246,0.18)",
  blueDeep: "#1d4ed8",

  green: "#10b981",
  greenGlow: "rgba(16,185,129,0.15)",

  amber: "#f59e0b",
  amberGlow: "rgba(245,158,11,0.12)",

  rose: "#f43f5e",
  roseGlow: "rgba(244,63,94,0.14)",

  violet: "#8b5cf6",
  violetGlow: "rgba(139,92,246,0.15)",

  text: "#e2e8f0",
  textSub: "#94a3b8",
  textMuted: "#475569",
};

/* ── role cards data ── */
const ROLES = [
  {
    key: "school",
    emoji: "🏛️",
    label: "School Admin",
    sub: "Register or manage your school account",
    accent: T.blue,
    glow: T.blueGlow,
    path: "/login?role=school",
    badge: "Register / Login",
    badgeColor: T.blue,
  },
  {
    key: "teacher",
    emoji: "👩‍🏫",
    label: "Teacher",
    sub: "Sign in with school name & password",
    accent: T.green,
    glow: T.greenGlow,
    path: "/login?role=teacher",
    badge: "Login",
    badgeColor: T.green,
  },
  {
    key: "student",
    emoji: "🎒",
    label: "Student",
    sub: "Login using your school code",
    accent: T.amber,
    glow: T.amberGlow,
    path: "/login?role=student",
    badge: "Login",
    badgeColor: T.amber,
  },
];

/* ── floating orbs ── */
function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* top-right */}
      <div style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: 560, height: 560, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 65%)",
        animation: "dvFloat 12s ease-in-out infinite",
      }} />
      {/* bottom-left */}
      <div style={{
        position: "absolute", bottom: "-18%", left: "-12%",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)",
        animation: "dvFloat 16s ease-in-out infinite reverse",
      }} />
      {/* center-faint */}
      <div style={{
        position: "absolute", top: "40%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 700, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(139,92,246,0.04) 0%, transparent 70%)",
      }} />
      {/* dot-grid */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}

/* ── stat pill ── */
function StatPill({ icon, label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "7px 14px", borderRadius: 40,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontSize: 12, color: T.textSub,
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </div>
  );
}

/* ── role card ── */
function RoleCard({ role, delay, onClick }) {
  return (
    <div
      className="dv-card-hover"
      onClick={onClick}
      style={{
        background: T.surface,
        border: `1.5px solid ${T.border}`,
        borderRadius: 20,
        padding: "28px 24px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        animation: `dvFadeUp 0.5s cubic-bezier(.22,.68,0,1.2) ${delay}ms both`,
      }}
    >
      {/* glow corner */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 130, height: 130, borderRadius: "50%",
        background: `radial-gradient(circle, ${role.glow} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16,
          background: `${role.accent}15`,
          border: `1.5px solid ${role.accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
        }}>
          {role.emoji}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: role.accent,
          background: `${role.accent}15`, border: `1px solid ${role.accent}30`,
          padding: "4px 10px", borderRadius: 20,
        }}>
          {role.badge}
        </span>
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>
        {role.label}
      </div>
      <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.55, marginBottom: 20 }}>
        {role.sub}
      </div>

      {/* CTA row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 14, borderTop: `1px solid ${T.border}`,
      }}>
        <span style={{ fontSize: 13, color: role.accent, fontWeight: 600 }}>
          Continue →
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: `${role.accent}18`, border: `1px solid ${role.accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: role.accent,
        }}>
          ›
        </div>
      </div>
    </div>
  );
}

/* ── main ── */
export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: T.bg, position: "relative", overflowX: "hidden" }}>
      <Orbs />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 520, margin: "0 auto", padding: "0 20px 60px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>

        {/* ── top bar ── */}
        <div style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "22px 0 0",
          animation: "dvFadeUp 0.4s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `linear-gradient(135deg, ${T.blue}, ${T.violet})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>📋</div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15,
              fontWeight: 600, color: T.text, letterSpacing: "-0.02em" }}>
              DocuVerify
            </span>
          </div>

          {/* Admin button — top right */}
          <button
            className="dv-btn-hover"
            onClick={() => navigate("/admin-login")}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 40,
              background: `${T.violet}15`,
              border: `1px solid ${T.violet}35`,
              color: T.violet, fontSize: 12, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.04em",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            <span style={{ fontSize: 14 }}>👑</span>
            Admin
          </button>
        </div>

        {/* ── hero ── */}
        <div style={{ textAlign: "center", padding: "52px 0 44px", animation: "dvFadeUp 0.45s 60ms ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 40, marginBottom: 22,
            background: `${T.blue}12`, border: `1px solid ${T.blue}30`,
            fontSize: 12, color: T.blue, fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%",
              background: T.blue, display: "inline-block",
              animation: "dvGlow 2s ease-in-out infinite" }} />
            School Document Platform
          </div>

          <h1 style={{
            fontSize: 38, fontWeight: 800, lineHeight: 1.13,
            letterSpacing: "-0.03em", marginBottom: 16,
            background: `linear-gradient(160deg, #f1f5f9 20%, ${T.blue} 80%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Manage School<br />Docs, Smarter
          </h1>

          <p style={{
            color: T.textSub, fontSize: 15, lineHeight: 1.7,
            maxWidth: 340, margin: "0 auto 28px",
          }}>
            AI-assisted document verification for schools. Secure, fast, and built for India.
          </p>

          {/* stat pills */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <StatPill icon="🏫" label="Multi-school SaaS" />
            <StatPill icon="🤖" label="AI Verification" />
            <StatPill icon="🔒" label="Firebase Secure" />
          </div>
        </div>

        {/* ── choose role label ── */}
        <div style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          marginBottom: 18, animation: "dvFadeUp 0.45s 120ms ease both",
        }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            Choose your role
          </span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* ── role cards ── */}
        <div style={{
          width: "100%", display: "flex", flexDirection: "column", gap: 14,
        }}>
          {ROLES.map((role, i) => (
            <RoleCard
              key={role.key}
              role={role}
              delay={160 + i * 80}
              onClick={() => navigate(role.path)}
            />
          ))}
        </div>

        {/* ── footer ── */}
        <div style={{
          marginTop: 44, textAlign: "center",
          fontSize: 12, color: T.textMuted,
          lineHeight: 1.8, animation: "dvFadeUp 0.4s 480ms ease both",
        }}>
          <div style={{ marginBottom: 6 }}>
            🔒 Secured by Firebase · ₹799/year per school
          </div>
          <div>
            Need help?{" "}
            <span style={{ color: T.blue, cursor: "pointer", textDecoration: "underline" }}>
              Contact support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
