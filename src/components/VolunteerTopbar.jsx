import { useNavigate, useLocation } from "react-router-dom";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { path: "/volunteer/dashboard",   label: "Dashboard" },
  { path: "/volunteer/assignments", label: "Assignments" },
  { path: "/volunteer/history",     label: "History" },
];

function getInitials(name) {
  return name
    .split(/[\s._\-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join("");
}

export default function VolunteerTopbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { userName, logout } = useAuth();
  const initials  = getInitials(userName);

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
        onClick={() => navigate("/volunteer/dashboard")}
      >
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: theme.teal,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px",
        }}>G</div>
        <div>
          <span style={{ fontSize: "14px", fontWeight: "600", letterSpacing: "-0.3px" }}>Gebirah</span>
          <span style={{ fontSize: "11px", color: theme.textTertiary, marginLeft: "6px", fontWeight: "400" }}>Volunteer</span>
        </div>
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
      <button 
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "5px 12px 5px 5px",
          borderRadius: "20px",
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "background 0.15s",
        }}
        title="Sign out"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        <div style={{
          width: "26px", height: "26px", borderRadius: "50%",
          background: theme.teal,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", fontWeight: "700", color: "#fff",
        }}>{initials}</div>
        <span style={{ fontSize: "12px", color: theme.textSecondary, fontWeight: "500" }}>{userName}</span>
      </button>
    </div>
  );
}
