import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VolunteerTopbar from "../../components/VolunteerTopbar";
import { Card, CardHeader } from "../../components/UIKit";
import { theme, btn } from "../../theme";
import { useVolunteer, V_STAGES } from "../../context/VolunteerContext";
import { useAuth } from "../../context/AuthContext";
import HandoverModal from "./HandoverModal";
import AssignmentCard from "./AssignmentCard";

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const {
    assignments, acceptAssignment, declineAssignment,
    startHandover, confirmHandover,
    allHistory, totalKgDelivered,
  } = useVolunteer();
  const [showHandover, setShowHandover] = useState(null);

  const activeAssignments = assignments.filter(a => a.stage !== V_STAGES.COMPLETED);
  const activeCount = activeAssignments.length;
  const activeItemsCount = activeAssignments.reduce((acc, a) => acc + a.items.length, 0);
  const totalWeightStr = activeAssignments.reduce((acc, a) => acc + a.totalWeight, 0).toFixed(1);

  function handleConfirmHandover() {
    if (showHandover) confirmHandover(showHandover);
    setShowHandover(null);
  }

  // Summary logic for header based on multiple active assignments
  const headerSummary = activeCount > 0 
    ? `You have ${activeCount} active handover${activeCount > 1 ? 's' : ''}`
    : "No active assignments \u00b7 set your availability in Assignments tab";

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.textPrimary, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", fontSize: "14px", lineHeight: "1.5" }}>
      {showHandover && (
        <HandoverModal 
          items={assignments.find(a => a.id === showHandover)?.items || []} 
          onClose={() => { setShowHandover(null); handleConfirmHandover(); }} 
        />
      )}
      <VolunteerTopbar />

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 28px" }}>
        {/* Page header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>
            Good morning, {userName}
          </div>
          <div style={{ fontSize: "13px", color: theme.textSecondary }}>
            {headerSummary}
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Active assignments", value: String(activeCount), sub: activeCount === 1 ? `to ${activeAssignments[0].destination}` : activeCount > 1 ? "multiple destinations" : "none right now", color: theme.teal },
            { label: "Items matched",      value: String(activeItemsCount), sub: activeCount > 0 ? `${totalWeightStr} kg total` : "awaiting assignment", color: theme.amber },
            { label: "Trips completed",    value: String(allHistory.length), sub: `${totalKgDelivered} kg delivered`, color: theme.green },
          ].map((m, i) => (
            <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "18px 20px", cursor: "pointer", transition: "all 0.15s" }}
                 onClick={() => m.label === "Trips completed" ? navigate("/volunteer/history") : navigate("/volunteer/assignments")}>
              <div style={{ fontSize: "11px", color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", fontWeight: "500" }}>{m.label}</div>
              <div style={{ fontSize: "28px", fontWeight: "600", letterSpacing: "-1px", lineHeight: "1", marginBottom: "4px", color: m.color }}>{m.value}</div>
              <div style={{ fontSize: "11px", color: theme.textTertiary, marginTop: "4px" }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>

          {/* Left col */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {assignments.length === 0 && (
              <Card>
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>&#128203;</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: theme.textPrimary, marginBottom: "4px" }}>No active assignment</div>
                  <div style={{ fontSize: "12px", color: theme.textSecondary, lineHeight: "1.6" }}>
                    Navigate to your Assignments tab to set your availability and receive an assignment
                  </div>
                </div>
              </Card>
            )}

            {assignments.map(a => (
              <AssignmentCard 
                key={a.id}
                assignment={a} 
                startHandover={startHandover} 
                acceptAssignment={acceptAssignment} 
                declineAssignment={declineAssignment} 
                setShowHandover={setShowHandover} 
              />
            ))}
          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Contribution stats */}
            <Card>
              <CardHeader title="My contribution" />
              <div style={{ padding: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { label: "Runs completed", value: String(allHistory.length), color: theme.teal },
                    { label: "Total kg",        value: totalKgDelivered,          color: theme.green },
                  ].map(s => (
                    <div key={s.label} style={{ background: theme.surface, borderRadius: "10px", padding: "14px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-1px", color: s.color, marginBottom: "4px" }}>{s.value}</div>
                      <div style={{ fontSize: "11px", color: theme.textSecondary }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <button style={{ ...btn("ghost"), width: "100%", fontSize: "12px" }} onClick={() => navigate("/volunteer/history")}>
                  View full history &rarr;
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
