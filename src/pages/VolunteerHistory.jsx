import { Card, Badge } from "../components/UIKit";
import { theme } from "../theme";
import { useVolunteers } from "../context/VolunteerContext";

export default function VolunteerHistory() {
  const { assignments } = useVolunteers();
  const completedAssignments = assignments.filter((assignment) => assignment.status === "completed");

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.04em" }}>History</div>
        <div style={{ marginTop: "8px", fontSize: "14px", color: "#786F62" }}>
          Completed handovers recorded in the volunteer workflow.
        </div>
      </div>

      <Card>
        <div style={{ padding: "0 22px" }}>
          {completedAssignments.map((assignment, index) => (
            <div
              key={assignment.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                padding: "18px 0",
                borderBottom: index < completedAssignments.length - 1 ? `1px solid ${theme.border}` : "none",
              }}
            >
              <div>
                <div style={{ fontSize: "17px", fontWeight: "600", color: theme.textPrimary }}>{assignment.item} · {assignment.destination}</div>
                <div style={{ marginTop: "6px", fontSize: "13px", color: theme.textSecondary }}>
                  {assignment.dateLabel} · Traveller {assignment.travellerName} · {assignment.weightKg} kg
                </div>
                <div style={{ marginTop: "4px", fontSize: "13px", color: theme.textTertiary }}>
                  Requester {assignment.requesterName}
                </div>
              </div>
              <Badge color="#547B30" bg="#E8F2D8">Done</Badge>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
