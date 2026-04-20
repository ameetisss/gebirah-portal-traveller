import { useState, useRef, useEffect } from "react";
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
  const { userName, userRole, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = getInitials(userName);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

      {/* Right Side Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* User chip */}
        <div 
          ref={menuRef}
          style={{ position: "relative" }}
        >
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "5px 12px 5px 5px",
              borderRadius: "999px",
              background: isMenuOpen ? theme.surfaceHover : "#FFFFFF",
              border: `1px solid ${isMenuOpen ? theme.accent : theme.border}`,
              boxShadow: isMenuOpen ? "none" : "0 6px 18px rgba(46, 35, 19, 0.05)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: avatarBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: "700", color: avatarColor,
            }}>{initials}</div>
            <span style={{ fontSize: "12px", color: theme.textSecondary }}>{userName}</span>
            <svg 
              width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ transform: isMenuOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
            >
              <path d="M1 1L5 5L9 1" stroke={theme.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "220px",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)",
              border: `1px solid ${theme.borderLight}`,
              padding: "8px",
              zIndex: 100,
              overflow: "hidden",
              animation: "fadeInScale 0.2s ease-out",
            }}>
              <style>
                {`
                  @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                  }
                `}
              </style>
              
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.borderLight}`, marginBottom: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: theme.textPrimary, marginBottom: "2px" }}>{userName}</div>
                <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {userRole}
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#ef4444",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fff1f1"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
