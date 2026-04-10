import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";
import { theme } from "../theme";
import { volunteerNavItems } from "../data/volunteerData";

export default function VolunteerPortal() {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: theme.textPrimary, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Topbar
        navItems={volunteerNavItems}
        homePath="/volunteer"
        brandLabel="Gebirah portal"
        logoBg="#ECE8FF"
        logoColor="#5D56B5"
        avatarBg="#EEF2D8"
        avatarColor="#5E6C26"
      />

      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "28px 28px 42px" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: "600", letterSpacing: "-0.05em" }}>
          Volunteer dashboard
        </h1>
        <div style={{ marginBottom: "22px", fontSize: "13px", color: theme.textSecondary }}>
          Manage airport handovers with the same card patterns and status language used across the traveller workflow.
        </div>
        <Outlet />
      </div>
    </div>
  );
}
