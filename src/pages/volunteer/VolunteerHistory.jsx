import { useState } from "react";
import VolunteerTopbar from "../../components/VolunteerTopbar";
import { Card, CardHeader, Badge } from "../../components/UIKit";
import { theme, btn } from "../../theme";
import { useVolunteer } from "../../context/VolunteerContext";

function AssignmentDetailModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "-0.4px", marginBottom: "4px" }}>
              Handover to {item.traveller}
            </div>
            <Badge color={theme.green} bg={theme.greenDim}>&#10003; Completed</Badge>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: theme.textTertiary, padding: "0 0 0 12px" }}>&#10005;</button>
        </div>

        {/* Details */}
        <div style={{ background: theme.surface, borderRadius: "10px", border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: "16px" }}>
          {[
            { label: "Traveller",    value: item.traveller },
            { label: "Destination",  value: item.destination },
            { label: "Flight",       value: item.flight || "—" },
            { label: "Date",         value: item.date },
            { label: "Total weight", value: `${item.kg} kg` },
          ].map((r, i, arr) => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : "none", fontSize: "13px" }}>
              <span style={{ color: theme.textSecondary }}>{r.label}</span>
              <span style={{ color: theme.textPrimary, fontWeight: "500" }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Items */}
        {item.itemsList && item.itemsList.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "8px" }}>Items carried</div>
            <div style={{ background: theme.surface, borderRadius: "10px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
              {item.itemsList.map((it, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: i < item.itemsList.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary }}>{it.name}</div>
                    <div style={{ fontSize: "11px", color: theme.textSecondary }}>for {it.requester}</div>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: theme.textSecondary }}>{it.weight} kg</span>
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

export default function VolunteerHistory() {
  const { allHistory, totalKgDelivered } = useVolunteer();
  const [selected, setSelected] = useState(null);

  const destinations = [...new Set(allHistory.map(h => h.destination.split(",")[0]))];
  const totalItems   = allHistory.reduce((s, h) => s + h.items, 0);

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.textPrimary, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", fontSize: "14px", lineHeight: "1.5" }}>
      {selected && <AssignmentDetailModal item={selected} onClose={() => setSelected(null)} />}

      <VolunteerTopbar />

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 28px" }}>

        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>Contribution history</div>
          <div style={{ fontSize: "13px", color: theme.textSecondary }}>Your full record of completed airport runs</div>
        </div>

        {/* Cumulative stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Runs completed",      value: String(allHistory.length), sub: "total assignments",         color: theme.teal  },
            { label: "Total kg delivered",  value: totalKgDelivered,          sub: "across all runs",           color: theme.green },
            { label: "Items carried",       value: String(totalItems),        sub: `${destinations.length} destinations`, color: theme.accent },
          ].map((s, i) => (
            <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "20px 24px" }}>
              <div style={{ fontSize: "11px", color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "500", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "-1.5px", lineHeight: "1", marginBottom: "4px", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: theme.textTertiary }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* History list */}
        <div style={{ maxWidth: "680px" }}>
          <Card>
            <div style={{ padding: "0 20px" }}>
              {allHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>&#128203;</div>
                  <div style={{ fontSize: "13px", color: theme.textSecondary }}>No completed assignments yet</div>
                </div>
              ) : allHistory.map((h, i) => (
                <div key={h.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: i < allHistory.length - 1 ? `1px solid ${theme.border}` : "none",
                  cursor: "pointer",
                }} onClick={() => setSelected(h)}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: theme.textPrimary }}>{h.traveller}</div>
                      <span style={{ fontSize: "11px", color: theme.textTertiary }}>&rarr;</span>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: theme.textPrimary }}>{h.destination}</div>
                    </div>
                    <div style={{ fontSize: "12px", color: theme.textSecondary }}>
                      {h.date} &middot; {h.items} items &middot; {h.kg} kg
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge color={theme.green} bg={theme.greenDim}>Delivered</Badge>
                    <span style={{ fontSize: "14px", color: theme.textTertiary }}>&rsaquo;</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
