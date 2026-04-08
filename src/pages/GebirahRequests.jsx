import { useMemo, useState } from "react";
import { Card, Badge } from "../components/UIKit";
import { theme, btn } from "../theme";
import { useRequests } from "../context/RequestContext";
import { useTrip } from "../context/TripContext";
import {
  getRequestQueue,
  requestStatusStyles,
  urgencyStyles,
} from "../data/gebirahData";

export default function GebirahRequests() {
  const { requests } = useRequests();
  const { trips } = useTrip();
  const [urgentOnly, setUrgentOnly] = useState(false);

  const queue = useMemo(() => {
    const fullQueue = getRequestQueue(requests, trips);
    return urgentOnly ? fullQueue.filter((request) => request.urgency === "High") : fullQueue;
  }, [requests, trips, urgentOnly]);

  return (
    <>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600", letterSpacing: "-0.05em" }}>Requests</h1>
        <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#786F62" }}>
          Live queue pulled from requester submissions, with status inferred from active traveller trips.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "14px" }}>
        <div style={{ fontSize: "14px", color: "#786F62" }}>{queue.length} open requests</div>
        <button
          type="button"
          onClick={() => setUrgentOnly((current) => !current)}
          style={{ ...btn("ghost"), borderRadius: "16px", padding: "14px 20px", background: urgentOnly ? "#F6EBDA" : "#FFF9F0", border: urgentOnly ? "1px solid #D8B57A" : "1px solid #D9CFBF", color: theme.textPrimary }}
        >
          {urgentOnly ? "Show all" : "Urgent only"}
        </button>
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "920px" }}>
            <thead>
              <tr style={{ color: "#6F685D", textAlign: "left" }}>
                {["Requester", "Item", "Destination", "Urgency", "Status", "Linked traveller", "Action"].map((header) => (
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
                  <td style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}`, fontSize: "14px", color: theme.textSecondary }}>
                    {request.linkedTrip ? `${request.linkedTrip.travellerName} · ${request.linkedTrip.flight}` : "No traveller yet"}
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
    </>
  );
}
