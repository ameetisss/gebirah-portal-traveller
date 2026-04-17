import { useContext } from "react";
import { theme, container, btn } from "../theme";
import { Card, Badge, LoadingState } from "../components/UIKit";
import { RequestContext } from "../context/RequestContext";
import { TripContext } from "../context/TripContext";
import { useNavigate } from "react-router-dom";

export default function GebirahDashboard() {
  const { requests, loading: reqLoading } = useContext(RequestContext);
  const { trips, loading: tripLoading } = useContext(TripContext);
  const navigate = useNavigate();

  if (reqLoading || tripLoading) return <LoadingState />;

  const pendingCount = requests.filter(r => r.statusKey === "waiting").length;
  const matchedCount = requests.filter(r => r.statusKey === "matched").length;
  const transitCount = requests.filter(r => r.statusKey === "inTransit").length;
  const fulfilledCount = requests.filter(r => r.statusKey === "delivered").length;

  const todaySchedule = trips.filter(t => t.status === "handover").slice(0, 5);

  return (
    <div style={container}>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "8px" }}>
          Coordinator Overview
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: "18px" }}>Gebirah Resource & Match Dashboard</p>
      </header>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "40px" }}>
        <MetricCard label="Pending Requests" value={pendingCount} color={theme.primary} trend="+12%" />
        <MetricCard label="Active Matches" value={matchedCount} color="#4D78C8" trend="Steady" />
        <MetricCard label="In Transit" value={transitCount} color="#FBC02D" trend="+4" />
        <MetricCard label="Fulfilled" value={fulfilledCount} color="#2E7D32" trend="84%" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
        {/* Main Schedule */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600" }}>Today's Handover Schedule</h2>
            <button onClick={() => navigate("/gebirah/handovers")} style={{ ...btn("ghost"), fontSize: "14px" }}>View Full Schedule →</button>
          </div>
          <Card>
            <div style={{ padding: "0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", background: "#F9F8F6", borderBottom: `1px solid ${theme.border}` }}>
                    <th style={{ padding: "16px 24px", fontSize: "12px", color: theme.textSecondary }}>Flight</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", color: theme.textSecondary }}>Parties</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", color: theme.textSecondary }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: "32px", textAlign: "center", color: theme.textSecondary }}>No handovers scheduled for today</td>
                    </tr>
                  ) : todaySchedule.map((trip) => (
                    <tr key={trip.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: "600" }}>{trip.flight_number}</div>
                        <div style={{ fontSize: "12px", color: theme.textSecondary }}>{trip.destination}</div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontSize: "14px" }}>{trip.traveller_name} ↔ {trip.handover_data?.volunteer || "Volunteer"}</div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <Badge bg={trip.handover_data?.brief_dispatched ? "#FFF9C4" : "#F0F1F3"} color={trip.handover_data?.brief_dispatched ? "#FBC02D" : "#3B424E"}>
                          {trip.handover_data?.brief_dispatched ? "Brief Dispatched" : "Awaiting Brief"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <ActionCard icon="➕" title="New Match" onClick={() => navigate("/gebirah/requests")} />
            <ActionCard icon="📋" title="Audit Logs" onClick={() => navigate("/gebirah/audit-log")} />
            <ActionCard icon="⚠️" title="Handle Exceptions" onClick={() => navigate("/gebirah/exceptions")} />
            <ActionCard icon="🤝" title="Manage Volunteers" onClick={() => navigate("/gebirah/volunteers")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, trend }) {
  return (
    <Card>
      <div style={{ padding: "24px" }}>
        <div style={{ color: theme.textSecondary, fontSize: "14px", marginBottom: "8px" }}>{label}</div>
        <div style={{ fontSize: "32px", fontWeight: "800", color: color }}>{value}</div>
        <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "8px" }}>{trend}</div>
      </div>
    </Card>
  );
}

function ActionCard({ icon, title, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "white", padding: "16px 20px", borderRadius: "12px", border: `1px solid ${theme.border}`,
      display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", transition: "all 0.2s ease"
    }}>
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontWeight: "600" }}>{title}</span>
    </div>
  );
}
