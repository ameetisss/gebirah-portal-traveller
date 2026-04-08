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
  travellerProgress = null,
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
      height: "64px",
      borderBottom: `1px solid ${theme.border}`,
      background: "rgba(255,255,255,0.86)",
      backdropFilter: "blur(18px)",
      boxShadow: "0 10px 30px rgba(46, 35, 19, 0.04)",
      position: "sticky",
      top: 0,
      zIndex: 20,
    }}>
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        onClick={() => navigate(homePath)}
      >
        <div style={{
          width: "30px", height: "30px", borderRadius: "10px",
          background: logoBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "700", color: logoColor, letterSpacing: "-0.5px",
          boxShadow: "0 8px 20px rgba(46, 35, 19, 0.08)",
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
                borderRadius: "999px",
                fontSize: "13px",
                cursor: "pointer",
                color: isActive ? theme.textPrimary : theme.textSecondary,
                background: isActive ? "#FFFFFF" : "transparent",
                border: `1px solid ${isActive ? theme.borderLight : "transparent"}`,
                fontFamily: "inherit",
                fontWeight: isActive ? "600" : "500",
                boxShadow: isActive ? "0 6px 18px rgba(46, 35, 19, 0.06)" : "none",
                transition: "all 0.18s ease",
              }}
              onClick={() => navigate(`${n.path}${n.hash ?? ""}`)}
            >{n.label}</button>
          );
        })}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {travellerProgress && (
          <div style={{
            minWidth: "248px",
            padding: "8px 12px",
            borderRadius: "999px",
            background: "#FFFFFF",
            border: `1px solid ${theme.border}`,
            boxShadow: "0 6px 18px rgba(46, 35, 19, 0.05)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", marginBottom: "5px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: theme.accent, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {travellerProgress.title}
              </span>
              <span style={{ fontSize: "11px", color: theme.textSecondary }}>
                {travellerProgress.nextLabel}
              </span>
            </div>
            <div style={{ height: "5px", borderRadius: "999px", background: theme.border, overflow: "hidden", marginBottom: "4px" }}>
              <div style={{ width: `${travellerProgress.progressPct}%`, height: "100%", background: theme.accent, borderRadius: "999px", transition: "width 0.25s ease" }} />
            </div>
            <div style={{ fontSize: "11px", color: theme.textTertiary }}>{travellerProgress.currentLabel}</div>
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "5px 12px 5px 5px",
          borderRadius: "999px",
          background: "#FFFFFF",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 6px 18px rgba(46, 35, 19, 0.05)",
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
    </div>
  );
}
