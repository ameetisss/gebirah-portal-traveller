import { Card, Badge } from "../components/UIKit";
import { theme, btn } from "../theme";
import { useRequests } from "../context/RequestContext";
import { useTrip } from "../context/TripContext";
import { useVolunteers } from "../context/VolunteerContext";
import {
  getGebirahMetrics,
  getHandoverRows,
  getRequestQueue,
  getTopTravellerStats,
  getTravellerRows,
  requestStatusStyles,
  urgencyStyles,
} from "../data/gebirahData";

function MetricCard({ metric }) {
  return (
    <Card>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: "11px", color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", fontWeight: "500" }}>{metric.label}</div>
        <div style={{ fontSize: "28px", lineHeight: 1, fontWeight: "600", letterSpacing: "-1px", color: theme.textPrimary }}>
          {metric.value}
        </div>
        <div style={{ marginTop: "6px", fontSize: "11px", color: theme.textTertiary }}>{metric.sublabel}</div>
      </div>
    </Card>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "600", letterSpacing: "-0.04em" }}>{children}</h2>;
}

export default function GebirahDashboard() {
  const { requests } = useRequests();
  const { trips, completedTrips } = useTrip();
  const { assignments } = useVolunteers();

  const metrics = getGebirahMetrics({ requests, trips, completedTrips, assignments });
  const queue = getRequestQueue(requests, trips).slice(0, 5);
  const travellers = getTravellerRows(trips).slice(0, 3);
  const handovers = getHandoverRows(trips, assignments).slice(0, 3);
  const topTravellers = getTopTravellerStats(completedTrips);

  return (
    <>
      <section style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "18px" }}>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600", letterSpacing: "-0.05em" }}>Coordinator dashboard</h1>
          <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#786F62" }}>
            Live coordinator view fed by requester submissions and traveller trips already active in the portal.
          </p>
        </div>

        <div className="gebirah-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}>
          {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </div>
      </section>

      <div className="gebirah-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(320px, 0.95fr)", gap: "24px", alignItems: "start" }}>
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "14px" }}>
            <SectionTitle>Request queue</SectionTitle>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button type="button" style={{ ...btn("ghost"), borderRadius: "16px", padding: "14px 20px", background: "#FFF9F0", border: "1px solid #D9CFBF", color: theme.textPrimary }}>
                Urgent only
              </button>
              <button type="button" style={{ ...btn("ghost"), borderRadius: "16px", padding: "14px 20px", background: "#FFF9F0", border: "1px solid #D9CFBF", color: theme.textPrimary }}>
                + New match
              </button>
            </div>
          </div>

          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
                <thead>
                  <tr style={{ color: "#6F685D", textAlign: "left" }}>
                    {["Requester", "Item", "Destination", "Urgency", "Status", "Action"].map((header) => (
                      <th key={header} style={{ padding: "18px 20px", fontSize: "13px", fontWeight: "600", borderBottom: `1px solid ${theme.border}` }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queue.map((request) => (
                    <tr key={request.id}>
                      <td style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}`, fontSize: "15px", fontWeight: "600" }}>{request.requester}</td>
                      <td style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}`, fontSize: "15px", color: theme.textSecondary }}>{request.item}</td>
                      <td style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}`, fontSize: "15px", color: theme.textSecondary }}>{request.destination}</td>
                      <td style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}` }}>
                        <Badge color={urgencyStyles[request.urgency].color} bg={urgencyStyles[request.urgency].bg}>{request.urgency}</Badge>
                      </td>
                      <td style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}` }}>
                        <Badge color={requestStatusStyles[request.status].color} bg={requestStatusStyles[request.status].bg}>{request.status}</Badge>
                      </td>
                      <td style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}` }}>
                        <button type="button" style={{ ...btn("ghost"), borderRadius: "8px", padding: "9px 14px" }}>
                          {request.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section>
            <div style={{ marginBottom: "12px" }}>
              <SectionTitle>Available travellers</SectionTitle>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {travellers.length === 0 && (
                <Card>
                  <div style={{ padding: "18px", fontSize: "14px", color: theme.textSecondary }}>No active traveller trips yet.</div>
                </Card>
              )}
              {travellers.map((traveller) => (
                <Card key={traveller.id}>
                  <div style={{ padding: "18px 18px 16px", display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "17px", fontWeight: "600", letterSpacing: "-0.03em" }}>{traveller.name}</div>
                      <div style={{ marginTop: "4px", fontSize: "14px", color: theme.textSecondary }}>
                        {traveller.destination} · {traveller.date} · {traveller.flight}
                      </div>
                    </div>
                    <Badge color="#4D78C8" bg="#E3EEFF">{traveller.freeKg}kg free</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div style={{ marginBottom: "12px" }}>
              <SectionTitle>Today&apos;s handovers</SectionTitle>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {handovers.length === 0 && (
                <Card>
                  <div style={{ padding: "18px", fontSize: "14px", color: theme.textSecondary }}>No live handovers yet.</div>
                </Card>
              )}
              {handovers.map((handover) => (
                <Card key={handover.id}>
                  <div style={{ display: "grid", gridTemplateColumns: "4px 1fr" }}>
                    <div style={{ background: handover.borderColor }} />
                    <div style={{ padding: "18px 18px 16px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: theme.textPrimary, marginBottom: "4px" }}>
                        {handover.time} · {handover.location}
                      </div>
                      <div style={{ fontSize: "14px", color: theme.textSecondary }}>{handover.summary}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div style={{ marginBottom: "12px" }}>
              <SectionTitle>Top travellers</SectionTitle>
            </div>
            <Card>
              <div style={{ padding: "8px 18px" }}>
                {topTravellers.map((traveller, index) => (
                  <div
                    key={traveller.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "14px",
                      alignItems: "center",
                      padding: "14px 0",
                      borderBottom: index < topTravellers.length - 1 ? `1px solid ${theme.border}` : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: theme.textPrimary }}>{traveller.name}</div>
                      <div style={{ marginTop: "3px", fontSize: "12px", color: theme.textSecondary }}>
                        {traveller.trips} trips completed
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: theme.accent }}>{traveller.kg.toFixed(1)} kg</div>
                      <div style={{ marginTop: "3px", fontSize: "12px", color: theme.textTertiary }}>
                        total carried
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .gebirah-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .gebirah-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .gebirah-metrics {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
