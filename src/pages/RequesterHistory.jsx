import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import { Card, Badge } from "../components/UIKit";
import { theme } from "../theme";

const REQUESTER_NAV_ITEMS = [
  { path: "/requester", label: "My requests" },
  { path: "/requester", hash: "#new-request", label: "New request" },
  { path: "/request-history", label: "History" },
];

const HISTORY_ITEMS = [
  {
    id: 1,
    title: "Infant formula",
    meta: "1.5 kg · Rafah · Delivered 4 Mar",
    route: "SQ 494 via Cairo",
  },
  {
    id: 2,
    title: "Winter clothing",
    meta: "3.0 kg · Khan Younis · Delivered 25 Feb",
    route: "EK 903 via Amman",
  },
  {
    id: 3,
    title: "First-aid kit",
    meta: "0.8 kg · Deir al-Balah · Delivered 11 Feb",
    route: "QR 946 via Doha",
  },
];

export default function RequesterHistory() {
  const { userId } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/api/item-requests/history?user_id=${userId || ""}`);
      const result = await res.json();
      if (result.status === "success") {
        const mapped = result.data.map(req => ({
          id: req.id,
          title: req.description,
          meta: `${req.weight_kg} kg · ${req.destination} · Delivered ${new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
          route: req.arrival_info || "Completed delivery",
        }));
        setItems(mapped);
      }
    } catch (e) {
      console.error("Fetch history error:", e);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: theme.textPrimary, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Topbar
        navItems={REQUESTER_NAV_ITEMS}
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
            {isLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: theme.textTertiary }}>Loading history...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: "60px 40px", textAlign: "center", color: theme.textSecondary }}>
                No completed requests found in your history.
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    padding: "22px 0",
                    borderBottom: index < items.length - 1 ? "1px solid #E7DED0" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: theme.textPrimary, marginBottom: "4px" }}>{item.title}</div>
                    <div style={{ fontSize: "14px", color: "#786F62", marginBottom: "4px" }}>{item.meta}</div>
                    <div style={{ fontSize: "14px", color: "#4F473C" }}>{item.route}</div>
                  </div>
                  <Badge color={theme.green} bg="#E5F3D9">Delivered</Badge>
                </div>
              ))
            )}
        </Card>
      </div>
    </div>
  );
}
