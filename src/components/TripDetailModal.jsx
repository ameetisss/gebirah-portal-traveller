import { theme, btn } from "../theme";
import { Badge, Card, CardHeader } from "./UIKit";

export default function TripDetailModal({ trip, onClose }) {
  if (!trip) return null;

  const rows = [
    { label: "Route",    value: trip.route },
    { label: "Flight",   value: trip.flight || "—" },
    { label: "Date",     value: trip.date },
    { label: "Total weight", value: `${trip.kg} kg` },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }}>
      <div style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: "16px",
        padding: "28px",
        width: "460px",
        maxWidth: "92vw",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "-0.4px", marginBottom: "4px" }}>
              {trip.route}
            </div>
            {trip.status === "declined" ? (
              <Badge color={theme.red} bg={theme.redDim}>Declined</Badge>
            ) : (trip.status === "unavailable" || trip.status === "no_volunteer") ? (
              <Badge color={theme.amber} bg={theme.amberDim}>No Volunteer</Badge>
            ) : (
              <Badge color={theme.green} bg={theme.greenDim}>&#10003; Delivered</Badge>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: theme.textTertiary, padding: "0 0 0 12px", lineHeight: 1 }}
          >&#10005;</button>
        </div>

        {/* Trip info */}
        <div style={{
          background: theme.surface,
          borderRadius: "10px",
          border: `1px solid ${theme.border}`,
          overflow: "hidden",
          marginBottom: "16px",
        }}>
          {rows.map((r, i) => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "11px 16px",
              borderBottom: i < rows.length - 1 ? `1px solid ${theme.border}` : "none",
              fontSize: "13px",
            }}>
              <span style={{ color: theme.textSecondary }}>{r.label}</span>
              <span style={{ color: theme.textPrimary, fontWeight: "500" }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Items carried */}
        {trip.itemsList && trip.itemsList.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "8px" }}>
              Items carried
            </div>
            <div style={{
              background: theme.surface,
              borderRadius: "10px",
              border: `1px solid ${theme.border}`,
              overflow: "hidden",
            }}>
              {trip.itemsList.map((item, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 16px",
                  borderBottom: i < trip.itemsList.length - 1 ? `1px solid ${theme.border}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary, marginBottom: "1px" }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: theme.textSecondary }}>for {item.requester}</div>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: theme.textSecondary }}>{item.weight} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteers */}
        {(trip.departureVolunteer || trip.arrivalVolunteer) && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "8px" }}>
              Volunteers
            </div>
            <div style={{
              background: theme.surface,
              borderRadius: "10px",
              border: `1px solid ${theme.border}`,
              overflow: "hidden",
            }}>
              {[
                { label: "Departure (SG)", value: trip.departureVolunteer, icon: "&#9992;" },
                { label: "Arrival (destination)", value: trip.arrivalVolunteer, icon: "&#128205;" },
              ].filter(v => v.value).map((v, i, arr) => (
                <div key={v.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 16px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : "none",
                  fontSize: "13px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span dangerouslySetInnerHTML={{ __html: v.icon }} />
                    <span style={{ color: theme.textSecondary }}>{v.label}</span>
                  </div>
                  <span style={{ color: theme.textPrimary, fontWeight: "500" }}>{v.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button style={{ ...btn("ghost"), width: "100%" }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
