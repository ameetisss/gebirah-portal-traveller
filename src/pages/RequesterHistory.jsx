import Topbar from "../components/Topbar";
import { Card, Badge } from "../components/UIKit";
import { theme } from "../theme";
import {
  placeholderRequesterHistory,
  requesterNavItems,
  requesterStatusMap,
} from "../data/requesterData";

export default function RequesterHistory() {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: theme.textPrimary, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Topbar
        navItems={requesterNavItems}
        homePath="/requester"
        brandLabel="Gebirah portal"
        logoBg="#ECE8FF"
        logoColor="#5D56B5"
        avatarBg="#FBEDE6"
        avatarColor="#9D5D2A"
      />

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "34px 28px 40px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "600", letterSpacing: "-0.04em" }}>History</h1>
          <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#786F62" }}>
            Delivered requests with completed routing details.
          </p>
        </div>

        <Card style={{ background: "#F8F4ED", border: "1px solid #E7DED0", borderRadius: "20px" }}>
          <div style={{ padding: "0 26px" }}>
            {placeholderRequesterHistory.map((item, index) => (
              <div
                key={item.id}
                style={{
                  padding: "22px 0",
                  borderBottom: index < placeholderRequesterHistory.length - 1 ? "1px solid #E7DED0" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: theme.textPrimary, marginBottom: "4px" }}>{item.title}</div>
                  <div style={{ fontSize: "14px", color: "#786F62", marginBottom: "4px" }}>
                    {item.weightKg} kg · {item.destination} · {item.deliveredLabel}
                  </div>
                  <div style={{ fontSize: "14px", color: "#4F473C" }}>{item.routeLabel}</div>
                </div>
                <Badge color={requesterStatusMap.delivered.color} bg={requesterStatusMap.delivered.bg}>
                  {requesterStatusMap.delivered.label}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
