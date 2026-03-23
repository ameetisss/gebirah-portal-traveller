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

const DEFAULT_NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/trip",      label: "My trip" },
  { path: "/history",   label: "History" },
];

export default function Topbar({
  navItems = DEFAULT_NAV_ITEMS,
  homePath = "/dashboard",
  brandLabel = "Gebirah",
  logoBg = theme.accent,
  logoColor = "#fff",
  avatarBg = theme.accent,
  avatarColor = "#fff",
}) {
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
        onClick={() => navigate(homePath)}
      >
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: logoBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "700", color: logoColor, letterSpacing: "-0.5px",
        }}>G</div>
        <span style={{ fontSize: "14px", fontWeight: "600", letterSpacing: "-0.3px" }}>{brandLabel}</span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
        {navItems.map(n => {
          const isActive = n.match
            ? n.match(location)
            : location.pathname === n.path && (n.hash ? location.hash === n.hash : true);
          return (
            <button
              key={`${n.path}${n.hash ?? ""}`}
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
              onClick={() => navigate(`${n.path}${n.hash ?? ""}`)}
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
          background: avatarBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", fontWeight: "700", color: avatarColor,
        }}>{initials}</div>
        <span style={{ fontSize: "12px", color: theme.textSecondary }}>{userName}</span>
      </div>
    </div>
  );
}
