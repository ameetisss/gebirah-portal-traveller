import { theme, btn } from "../../theme";
import { Badge, StatusDot, Card, CardHeader } from "../../components/UIKit";
import { V_STAGES } from "../../context/VolunteerContext";

export default function AssignmentCard({ assignment, startHandover, acceptAssignment, declineAssignment, setShowHandover }) {
  // If assignment is not passed, it means we don't have one active to show (for error fallback, though we shouldn't render this without an assignment)
  if (!assignment) return null;

  const { stage: assignmentStage, id } = assignment;
  const a = assignment;

  const assignmentBadge = {
    [V_STAGES.PENDING]:   <Badge color={theme.amber}  bg={theme.amberDim}>New assignment</Badge>,
    [V_STAGES.ACCEPTED]:  <Badge color={theme.green}  bg={theme.greenDim}><StatusDot color={theme.green} />Active</Badge>,
    [V_STAGES.HANDOVER]:  <Badge color={theme.teal}   bg={theme.tealDim}>Handover</Badge>,
    [V_STAGES.COMPLETED]: <Badge color={theme.green}  bg={theme.greenDim}><StatusDot color={theme.green} />Completed</Badge>,
    [V_STAGES.NONE]:      null,
  }[assignmentStage];

  return (
    <Card>
      <CardHeader title="Current assignment" right={assignmentBadge} />
      <div style={{ padding: "20px" }}>
        {assignmentStage === V_STAGES.PENDING && (
          <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: theme.amberDim, border: `1px solid ${theme.amber}40`, borderRadius: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px" }}>&#128203;</span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: theme.amber }}>New assignment received</div>
                <div style={{ fontSize: "11px", color: theme.textSecondary }}>Please accept or decline within 24 hours</div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>
              {a.flight} &middot; {a.destination}
            </div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "16px" }}>
              Departure {a.departureDate} &middot; {a.handoverTime} handover
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: theme.surface, borderRadius: "8px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: theme.accentDim, border: `2px solid ${theme.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: theme.accent, flexShrink: 0 }}>
                {a.travellerInitials}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: theme.textPrimary }}>Traveller: {a.traveller}</div>
                <div style={{ fontSize: "11px", color: theme.textSecondary }}>{a.travellerPhone}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              {[
                { label: "Items to carry", value: `${a.items.length} items` },
                { label: "Total weight",   value: `${a.totalWeight} kg` },
                { label: "Handover",       value: `${a.handoverDate} \u00b7 ${a.handoverTime}` },
                { label: "Location",       value: a.handoverLocation.split(",")[0] },
              ].map(d => (
                <div key={d.label} style={{ background: theme.surface, borderRadius: "8px", padding: "10px 12px", border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: "10px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "500", marginBottom: "3px" }}>{d.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: theme.textPrimary }}>{d.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ ...btn("ghost"), flex: 1 }} onClick={() => declineAssignment(id)}>Decline</button>
              <button style={{ ...btn("primary"), flex: 2 }} onClick={() => acceptAssignment(id)}>Accept assignment</button>
            </div>
          </div>
        )}

        {assignmentStage === V_STAGES.ACCEPTED && (
          <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#F59E0B15", border: `1px solid ${theme.amber}40`, borderRadius: "8px", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px" }}>&#9201;</span>
              <span style={{ fontSize: "12px", color: theme.amber, fontWeight: "500" }}>Reminder: Handover in ~24 hours &middot; allow time for travel</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>
              {a.flight} &middot; {a.destination}
            </div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "16px" }}>
              Departure {a.departureDate}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
              {[
                { label: "Items to carry", value: `${a.items.length} items`, color: theme.textPrimary },
                { label: "Total weight",   value: `${a.totalWeight} kg`,     color: theme.teal },
              ].map(c => (
                <div key={c.label} style={{ background: theme.surface, borderRadius: "8px", padding: "10px 12px", border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: "10px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "500", marginBottom: "4px" }}>{c.label}</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: c.color, letterSpacing: "-0.4px" }}>{c.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: `${theme.teal}10`, border: `1px solid ${theme.teal}40`, borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", color: theme.teal, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600", marginBottom: "6px" }}>Handover details</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: theme.textPrimary, marginBottom: "2px" }}>{a.handoverDate} &middot; {a.handoverTime}</div>
              <div style={{ fontSize: "12px", color: theme.textSecondary }}>{a.handoverLocation}</div>
              <div style={{ fontSize: "12px", color: theme.textSecondary }}>Meet: {a.traveller} &middot; {a.travellerPhone}</div>
            </div>
            <button style={{ ...btn("primary"), width: "100%", background: theme.teal }} onClick={() => startHandover(id)}>
              I'm at the meetup point
            </button>
          </div>
        )}

        {assignmentStage === V_STAGES.HANDOVER && (
          <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>{a.flight} &middot; {a.destination}</div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "16px" }}>
              Hand over all items to {a.traveller} before they board
            </div>
            <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "8px" }}>
              Items to hand over
            </div>
            {a.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < a.items.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary }}>{item.name}</div>
                  <div style={{ fontSize: "11px", color: theme.textSecondary }}>{item.description} &middot; {item.requester}</div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: theme.textSecondary }}>{item.weight} kg</span>
              </div>
            ))}
            <button style={{ ...btn("primary"), width: "100%", marginTop: "16px", background: theme.teal }} onClick={() => setShowHandover(id)}>
              Confirm handover complete
            </button>
          </div>
        )}

        {assignmentStage === V_STAGES.COMPLETED && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: theme.greenDim, border: `2px solid ${theme.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "28px" }}>&#10003;</div>
            <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px" }}>Assignment complete!</div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, lineHeight: "1.7" }}>
              {a.totalWeight} kg delivered to {a.traveller}<br />
              Thank you for your contribution <span role="img" aria-label="party">🎉</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
