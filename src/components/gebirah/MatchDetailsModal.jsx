import { theme, btn } from "../../theme";
import { Card, Badge } from "../UIKit";

export default function MatchDetailsModal({ request, trip, onClose, onConfirm }) {
  if (!request || !trip) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px"
    }}>
      <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "800px", overflow: "hidden" }}>
        <div style={{ padding: "24px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Confirm Assignment</h2>
          <button onClick={onClose} style={{ ...btn("ghost"), padding: "8px" }}>✕</button>
        </div>
        
        <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: theme.textSecondary, marginBottom: "12px", textTransform: "uppercase" }}>Request Details</h3>
            <Card>
              <div style={{ padding: "16px" }}>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{request.item}</div>
                <div style={{ fontSize: "14px", color: theme.textSecondary }}>{request.requester} · {request.destination}</div>
                <div style={{ marginTop: "12px" }}>
                  <Badge color="#E54D2E" bg="#FFECE3">{request.urgency} Urgency</Badge>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: theme.textSecondary, marginBottom: "12px", textTransform: "uppercase" }}>Traveller Details</h3>
            <Card>
              <div style={{ padding: "16px" }}>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{trip.name}</div>
                <div style={{ fontSize: "14px", color: theme.textSecondary }}>{trip.flight} · {trip.date}</div>
                <div style={{ marginTop: "12px" }}>
                  <Badge color="#4D78C8" bg="#E3EEFF">{trip.freeKg}kg Available</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div style={{ padding: "24px", background: "#F9F8F6", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} style={btn("ghost")}>Cancel</button>
          <button onClick={onConfirm} style={btn("primary")}>Confirm Assignment</button>
        </div>
      </div>
    </div>
  );
}
