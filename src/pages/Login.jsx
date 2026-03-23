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

  function handleSubmit(e) {
    e.preventDefault();
    if (method === "email") {
      if (!email || !password) { setError("Please enter your email and password."); return; }
    } else {
      if (!phone || !password) { setError("Please enter your phone number and password."); return; }
      if (!/^\+?[\d\s\-]{7,15}$/.test(phone)) { setError("Please enter a valid phone number."); return; }
    }
    if (password.length < 6) { setError("Incorrect credentials."); return; }
    setError("");
    login(method === "email" ? email : phone, method, role);
    navigate(role === "requester" ? "/requester" : "/dashboard");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      fontSize: "14px",
      color: theme.textPrimary,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "9px",
          background: theme.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px",
        }}>G</div>
        <span style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "-0.4px" }}>Gebirah</span>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: "380px",
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: "16px",
        padding: "32px",
        boxSizing: "border-box",
        margin: "0 16px",
      }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "20px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>
            Portal login
          </div>
          <div style={{ fontSize: "13px", color: theme.textSecondary }}>
            Choose your role, then sign in to the right workspace
          </div>
        </div>

        <div style={{
          display: "flex",
          background: theme.surfaceHover,
          border: `1px solid ${theme.border}`,
          borderRadius: "10px",
          padding: "3px",
          marginBottom: "16px",
        }}>
          {[
            { key: "traveller", label: "Traveller" },
            { key: "requester", label: "Requester" },
          ].map(option => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRole(option.key)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "7px",
                border: "none",
                fontSize: "13px",
                fontWeight: "500",
                fontFamily: "inherit",
                cursor: "pointer",
                background: role === option.key ? theme.bg : "transparent",
                color: role === option.key ? theme.textPrimary : theme.textTertiary,
                boxShadow: role === option.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div style={{
          fontSize: "12px",
          color: theme.textSecondary,
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: "10px",
          padding: "10px 12px",
          marginBottom: "20px",
          lineHeight: "1.5",
        }}>
          {role === "requester"
            ? "Requester sign-in opens the request tracking portal with the embedded request form."
            : "Traveller sign-in opens the existing trip dashboard and match flow."}
        </div>

        {/* Method toggle */}
        <div style={{
          display: "flex",
          background: theme.surfaceHover,
          border: `1px solid ${theme.border}`,
          borderRadius: "10px",
          padding: "3px",
          marginBottom: "20px",
        }}>
          {["email", "phone"].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMethod(m)}
              style={{
                flex: 1, padding: "7px",
                borderRadius: "7px", border: "none",
                fontSize: "13px", fontWeight: "500", fontFamily: "inherit", cursor: "pointer",
                transition: "all 0.15s",
                background: method === m ? theme.bg : "transparent",
                color: method === m ? theme.textPrimary : theme.textTertiary,
                boxShadow: method === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
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
                style={inputStyle}
              />
            ) : (
              <input
                type="tel" placeholder="+65 9123 4567"
                value={phone} onChange={e => setPhone(e.target.value)}
                style={inputStyle}
              />
            )}
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{
                fontSize: "11px", color: theme.textTertiary,
                textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600",
              }}>Password</label>
              <span style={{ fontSize: "12px", color: theme.accent, cursor: "pointer" }}>Forgot password?</span>
            </div>
            <input
              type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              fontSize: "12px", color: theme.red,
              background: "#EF444415", border: "1px solid #EF444430",
              borderRadius: "8px", padding: "10px 12px",
            }}>{error}</div>
          )}

          <button
            type="submit"
            style={{
              marginTop: "4px", padding: "10px 16px",
              borderRadius: "8px", fontSize: "14px", fontWeight: "500",
              cursor: "pointer", border: "none",
              background: theme.accent, color: "#fff",
              fontFamily: "inherit",
            }}
          >
            Sign in
          </button>
        </form>
      </div>

      <div style={{ marginTop: "20px", fontSize: "12px", color: theme.textTertiary }}>
        Role selection controls where you land after sign-in.
      </div>
    </div>
  );
}
