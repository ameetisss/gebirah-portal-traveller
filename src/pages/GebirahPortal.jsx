import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";
import { theme } from "../theme";
import { gebirahNavItems } from "../data/gebirahData";

export default function GebirahPortal() {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: theme.textPrimary, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Topbar
        navItems={gebirahNavItems}
        homePath="/gebirah"
        brandLabel="Gebirah portal"
        logoBg="#ECE8FF"
        logoColor="#5D56B5"
        avatarBg="#ECE8FF"
        avatarColor="#5D56B5"
      />

      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "34px 28px 42px" }}>
        <Outlet />
      </div>
    </div>
  );
}
