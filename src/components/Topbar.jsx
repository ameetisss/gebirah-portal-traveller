import { useNavigate, useLocation } from "react-router-dom";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";

function getInitials(name) {
  return name
    .split(/[\s._\-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join("");
}

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/trip",      label: "My trip" },
  { path: "/history",   label: "History" },
];

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName } = useAuth();
  const initials = getInitials(userName);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      height: "56px",
      borderBottom: `1px solid ${theme.border}`,
      background: theme.bg,
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        onClick={() => navigate("/dashboard")}
      >
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: theme.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px",
        }}>G</div>
        <span style={{ fontSize: "14px", fontWeight: "600", letterSpacing: "-0.3px" }}>Gebirah</span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: "4px" }}>
        {NAV_ITEMS.map(n => {
          const isActive = location.pathname === n.path;
          return (
            <button
              key={n.path}
              style={{
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                cursor: "pointer",
                color: isActive ? theme.textPrimary : theme.textSecondary,
                background: isActive ? theme.surfaceHover : "transparent",
                border: `1px solid ${isActive ? theme.borderLight : "transparent"}`,
                fontFamily: "inherit",
                fontWeight: isActive ? "500" : "400",
              }}
              onClick={() => navigate(n.path)}
            >{n.label}</button>
          );
        })}
      </nav>

      {/* User chip */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "5px 12px 5px 5px",
        borderRadius: "20px",
        background: theme.surface,
        border: `1px solid ${theme.border}`,
      }}>
        <div style={{
          width: "26px", height: "26px", borderRadius: "50%",
          background: theme.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", fontWeight: "700", color: "#fff",
        }}>{initials}</div>
        <span style={{ fontSize: "12px", color: theme.textSecondary }}>{userName}</span>
      </div>
    </div>
  );
}
