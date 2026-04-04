import { useState } from "react";
import VolunteerTopbar from "../../components/VolunteerTopbar";
import { Card, CardHeader, Badge } from "../../components/UIKit";
import { theme } from "../../theme";
import { useVolunteer, V_STAGES } from "../../context/VolunteerContext";
import HandoverModal from "./HandoverModal";
import AssignmentCard from "./AssignmentCard";
import AvailabilityCard from "./AvailabilityCard";

export default function VolunteerAssignments() {
  const {
    assignments, acceptAssignment, declineAssignment,
    startHandover, confirmHandover, availability, toggleAvailability, findMatch
  } = useVolunteer();
  const [showHandover, setShowHandover] = useState(null);

  const activeAssignments = assignments.filter(a => a.stage !== V_STAGES.COMPLETED);
  const activeItemsCount = activeAssignments.reduce((acc, a) => acc + a.items.length, 0);
  const totalWeightStr = activeAssignments.reduce((acc, a) => acc + a.totalWeight, 0).toFixed(1);

  function handleConfirmHandover() {
    if (showHandover) {
      confirmHandover(showHandover);
    }
    setShowHandover(null);
  }

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
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>
            My assignments
          </div>
          <div style={{ fontSize: "13px", color: theme.textSecondary }}>
            Manage your active handovers
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <AvailabilityCard 
              availability={availability} 
              toggleAvailability={toggleAvailability} 
              findMatch={findMatch}
            />

            {assignments.length === 0 && (
              <Card>
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>&#128203;</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: theme.textPrimary, marginBottom: "4px" }}>No active assignments</div>
                  <div style={{ fontSize: "12px", color: theme.textSecondary, lineHeight: "1.6" }}>
                    Configure your availability and tap "Save & Find Matches" above.
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

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Items to hand over */}
            <Card>
              <CardHeader
                title="Items to hand over"
                right={activeItemsCount > 0
                  ? <Badge color={theme.amber} bg={theme.amberDim}>{activeItemsCount} items</Badge>
                  : null}
              />
              {activeAssignments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 20px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>&#128230;</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary, marginBottom: "4px" }}>No items assigned yet</div>
                  <div style={{ fontSize: "12px", color: theme.textSecondary }}>Items will appear once you get a match</div>
                </div>
              ) : (
                <div style={{ padding: "0 20px" }}>
                  {activeAssignments.map(a => (
                    <div key={a.id}>
                      <div style={{ fontSize: "11px", color: theme.teal, fontWeight: "600", padding: "12px 0 6px", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${theme.borderLight}` }}>For {a.traveller} &middot; {a.flight}</div>
                      {a.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary, marginBottom: "2px" }}>{item.name}</div>
                            <div style={{ fontSize: "11px", color: theme.textSecondary }}>{item.requester} &middot; {item.weight} kg</div>
                          </div>
                          {a.stage === V_STAGES.ACCEPTED || a.stage === V_STAGES.HANDOVER ? <Badge color={theme.green} bg={theme.greenDim}>Active</Badge> : <Badge color={theme.amber} bg={theme.amberDim}>Pending</Badge>}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: theme.bg, borderRadius: "8px", margin: "12px 0 16px", border: `1px solid ${theme.border}` }}>
                    <span style={{ fontSize: "12px", color: theme.textSecondary }}>Total weight</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: theme.teal }}>{totalWeightStr} kg</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
