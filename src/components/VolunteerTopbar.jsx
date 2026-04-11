import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { theme, btn } from "../theme";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { path: "/volunteer/dashboard",   label: "Dashboard" },
  { path: "/volunteer/assignments", label: "Assignments" },
  { path: "/volunteer/history",     label: "History" },
];

function getInitials(name) {
  if (!name || typeof name !== "string") return "V";
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const initials  = getInitials(userName);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      zIndex: 100,
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
      <div style={{ position: "relative" }} ref={menuRef}>
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
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div style={{
            width: "26px", height: "26px", borderRadius: "50%",
            background: theme.teal,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "10px", fontWeight: "700", color: "#fff",
          }}>{initials}</div>
          <span style={{ fontSize: "12px", color: theme.textSecondary, fontWeight: "500" }}>{userName}</span>
        </button>

        {showUserMenu && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "160px",
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: "12px",
            padding: "6px",
            boxShadow: "0 10px 25px -10px rgba(0,0,0,0.15)",
            zIndex: 101,
          }}>
            <button
              style={{
                ...btn("ghost"),
                width: "100%",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13px",
                color: theme.red,
                fontWeight: "500",
                border: "none",
                background: "transparent",
              }}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Sign out <span>&rarr;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
