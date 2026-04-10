import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: `1px solid ${theme.border}`,
  background: theme.bg,
  color: theme.textPrimary,
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const roleContent = {
  traveller: {
    title: "Carry with purpose",
    description: "Register spare baggage, accept a match, and hand over aid through a guided traveller flow built around airport handovers and secure delivery.",
    accent: "#2E6A57",
    accentBg: "#E4F1EC",
  },
  requester: {
    title: "Request essentials clearly",
    description: "Submit what is needed, add context, and track each step from review through delivery without losing sight of where help stands.",
    accent: "#91512A",
    accentBg: "#F7E8DC",
  },
  gebirah: {
    title: "Coordinate the whole mission",
    description: "Review requests, connect travellers and volunteers, and keep every handover visible across the system from one operational dashboard.",
    accent: "#5D56B5",
    accentBg: "#ECE8FF",
  },
  volunteer: {
    title: "Bridge the airport handover",
    description: "Receive assignments, bring packed items to the traveller, confirm the airport exchange, and keep the mission moving on time.",
    accent: "#5E6C26",
    accentBg: "#EEF2D8",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole]         = useState("traveller");
  const [method, setMethod]     = useState("email");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  function switchMethod(m) {
    setMethod(m);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (method === "email") {
      if (!email) { setError("Please enter your email."); return; }
    } else {
      if (!phone) { setError("Please enter your phone number."); return; }
      if (!/^\+?[\d\s\-]{7,15}$/.test(phone)) { setError("Please enter a valid phone number."); return; }
    }
    setError("");
    login(method === "email" ? email : phone, method, role);
    navigate(role === "requester" ? "/requester" : role === "gebirah" ? "/gebirah" : role === "volunteer" ? "/volunteer" : "/dashboard");
  }

  const activeRole = roleContent[role];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #F7F4EE 0%, #F4EFE7 48%, #EFE8DE 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "28px",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      fontSize: "14px",
      color: theme.textPrimary,
    }}>
      <div
        className="login-shell"
        style={{
        width: "100%",
        maxWidth: "1180px",
        display: "grid",
        gridTemplateColumns: "1.08fr minmax(360px, 0.82fr)",
        background: "rgba(255,255,255,0.74)",
        border: "1px solid rgba(170, 155, 136, 0.22)",
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: "0 22px 70px rgba(82, 64, 41, 0.12)",
        backdropFilter: "blur(18px)",
      }}
      >
        <section style={{
          position: "relative",
          padding: "42px 40px 38px",
          background: "radial-gradient(circle at top left, rgba(124,110,248,0.18), transparent 38%), radial-gradient(circle at 90% 15%, rgba(46,106,87,0.15), transparent 34%), linear-gradient(180deg, #F8F3EA 0%, #F4EEE5 100%)",
          borderRight: "1px solid rgba(170, 155, 136, 0.18)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "26px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "12px",
                background: "#FFFFFF",
                border: `1px solid ${theme.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px", fontWeight: "700", color: activeRole.accent, letterSpacing: "-0.5px",
                boxShadow: "0 10px 24px rgba(92, 72, 49, 0.08)",
              }}>G</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "-0.04em" }}>Gebirah</div>
                <div style={{ fontSize: "12px", color: "#7E7467" }}>Humanitarian travel relay portal</div>
              </div>
            </div>

            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "999px",
              background: activeRole.accentBg,
              color: activeRole.accent,
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "18px",
            }}>
              Mission access
            </div>

            <h1 style={{ margin: 0, maxWidth: "540px", fontSize: "40px", lineHeight: "1.02", fontWeight: "600", letterSpacing: "-0.07em" }}>
              Aid moves through people, timing, and trust.
            </h1>
            <p style={{ margin: "16px 0 0", maxWidth: "520px", fontSize: "16px", lineHeight: "1.65", color: "#665D52" }}>
              Gebirah connects requesters, travellers, volunteers, and coordinators into one handover chain so essentials can move across borders with clarity.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "14px",
          }}>
            {[
              { label: "Traveller", text: "Carries matched items within declared spare baggage." },
              { label: "Volunteer", text: "Brings packed items to the airport handover point." },
              { label: "Gebirah", text: "Coordinates triage, sourcing, matching, and delivery follow-through." },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "16px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(170, 155, 136, 0.18)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#7A7062", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700", marginBottom: "8px" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "14px", lineHeight: "1.55", color: "#473F35" }}>{item.text}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: "18px 20px",
            borderRadius: "20px",
            background: "#FFFFFF",
            border: "1px solid rgba(170, 155, 136, 0.18)",
            boxShadow: "0 14px 28px rgba(92, 72, 49, 0.06)",
          }}>
            <div style={{ fontSize: "12px", color: "#8A8072", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700", marginBottom: "10px" }}>
              Active role
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.05em", color: activeRole.accent }}>{activeRole.title}</div>
                <div style={{ marginTop: "6px", maxWidth: "520px", fontSize: "14px", lineHeight: "1.6", color: "#5E554A" }}>
                  {activeRole.description}
                </div>
              </div>
              <div style={{
                minWidth: "88px",
                padding: "10px 12px",
                borderRadius: "16px",
                background: activeRole.accentBg,
                color: activeRole.accent,
                fontSize: "13px",
                fontWeight: "700",
                textAlign: "center",
              }}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>
          </div>
        </section>

        <section style={{
          padding: "38px 34px",
          background: "rgba(255,255,255,0.88)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "12px", color: "#8A8072", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700", marginBottom: "8px" }}>
              Secure access
            </div>
            <div style={{ fontSize: "28px", fontWeight: "600", letterSpacing: "-0.06em", marginBottom: "6px" }}>
              Enter the portal
            </div>
            <div style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: "1.6" }}>
              Choose your mission role, then sign in to the workspace that supports your part of the handover chain.
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "8px",
            marginBottom: "18px",
          }}>
            {[
              { key: "traveller", label: "Traveller" },
              { key: "requester", label: "Requester" },
              { key: "gebirah", label: "Gebirah" },
              { key: "volunteer", label: "Volunteer" },
            ].map(option => {
              const isActive = role === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRole(option.key)}
                  style={{
                    padding: "14px 12px",
                    borderRadius: "16px",
                    border: isActive ? `1px solid ${activeRole.accent}55` : `1px solid ${theme.border}`,
                    background: isActive ? activeRole.accentBg : "#FFFFFF",
                    color: isActive ? activeRole.accent : theme.textSecondary,
                    fontSize: "13px",
                    fontWeight: "600",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: isActive ? "0 10px 24px rgba(92, 72, 49, 0.06)" : "none",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div style={{
            fontSize: "13px",
            color: "#5F554A",
            background: "#FBF8F2",
            border: `1px solid ${theme.border}`,
            borderRadius: "14px",
            padding: "12px 14px",
            marginBottom: "18px",
            lineHeight: "1.6",
          }}>
            {activeRole.description}
          </div>

          <div style={{
            display: "flex",
            background: "#F7F3ED",
            border: `1px solid ${theme.border}`,
            borderRadius: "14px",
            padding: "4px",
            marginBottom: "20px",
          }}>
            {["email", "phone"].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => switchMethod(m)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "600",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: method === m ? "#FFFFFF" : "transparent",
                  color: method === m ? theme.textPrimary : theme.textTertiary,
                  boxShadow: method === m ? "0 4px 14px rgba(92, 72, 49, 0.08)" : "none",
                }}
              >
                {m === "email" ? "Email" : "Phone number"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{
                display: "block", fontSize: "11px", color: theme.textTertiary,
                textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "6px",
              }}>
                {method === "email" ? "Email" : "Phone number"}
              </label>
              {method === "email" ? (
                <input
                  type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ ...inputStyle, padding: "13px 14px", borderRadius: "12px", background: "#FFFFFF" }}
                />
              ) : (
                <input
                  type="tel" placeholder="+65 9123 4567"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ ...inputStyle, padding: "13px 14px", borderRadius: "12px", background: "#FFFFFF" }}
                />
              )}
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{
                  fontSize: "11px", color: theme.textTertiary,
                  textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600",
                }}>Password</label>
                <span style={{ fontSize: "12px", color: activeRole.accent, cursor: "pointer" }}>Forgot password?</span>
              </div>
              <input
                type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, padding: "13px 14px", borderRadius: "12px", background: "#FFFFFF" }}
              />
            </div>

            {error && (
              <div style={{
                fontSize: "12px", color: theme.red,
                background: "#EF444415", border: "1px solid #EF444430",
                borderRadius: "12px", padding: "10px 12px",
              }}>{error}</div>
            )}

            <button
              type="submit"
              style={{
                marginTop: "4px",
                padding: "13px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                background: activeRole.accent,
                color: "#fff",
                fontFamily: "inherit",
                boxShadow: "0 12px 24px rgba(92, 72, 49, 0.12)",
              }}
            >
              Sign in to {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </form>

          <div style={{
            marginTop: "18px",
            paddingTop: "16px",
            borderTop: `1px solid ${theme.border}`,
            fontSize: "12px",
            color: theme.textTertiary,
            lineHeight: "1.6",
          }}>
            Role selection controls where you land after sign-in. Use any password longer than 6 characters for demo access.
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .login-shell {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
