import { Link } from "react-router-dom";
import { Card, Badge } from "../components/UIKit";
import { theme, btn } from "../theme";
import { useVolunteers } from "../context/VolunteerContext";
import { useRequests } from "../context/RequestContext";
import { volunteerStatusStyles } from "../data/volunteerData";

function Metric({ label, value, sublabel }) {
  return (
    <Card>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: "11px", color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", fontWeight: "500" }}>{label}</div>
        <div style={{ fontSize: "28px", lineHeight: 1, fontWeight: "600", color: theme.textPrimary, letterSpacing: "-1px" }}>{value}</div>
        <div style={{ marginTop: "6px", fontSize: "11px", color: theme.textTertiary }}>{sublabel}</div>
      </div>
    </Card>
  );
}

function AssignmentCard({ assignment, onAccept, onDecline, onComplete }) {
  const statusMeta = volunteerStatusStyles[assignment.status];
  const canComplete = assignment.status === "confirmed";
  const isPending = assignment.status === "pending";

  return (
    <Card>
      <div style={{ display: "grid", gridTemplateColumns: "4px 1fr" }}>
        <div style={{ background: isPending ? "#D86B6B" : "#62C699" }} />
        <div style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: theme.textPrimary }}>
                Airport handover · {assignment.location}
              </div>
              <div style={{ marginTop: "4px", fontSize: "13px", color: theme.textSecondary }}>
                {assignment.dateLabel} · {assignment.time} · {assignment.landmark}
              </div>
            </div>
            <Badge color={statusMeta.color} bg={statusMeta.bg}>{statusMeta.label}</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", margin: "14px 0" }}>
            {[
              { label: "Traveller", value: assignment.travellerName },
              { label: "Flight", value: assignment.flight },
              { label: "Total weight", value: `${assignment.weightKg} kg` },
            ].map((item) => (
              <div key={item.label} style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "12px 12px 10px" }}>
                <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "6px" }}>{item.label}</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: theme.textPrimary }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "12px 14px", marginBottom: "14px", background: theme.bg }}>
            <div style={{ fontSize: "12px", color: theme.textTertiary, marginBottom: "8px" }}>Items to hand over</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "14px", color: theme.textPrimary }}>
              <span>{assignment.item}</span>
              <span style={{ color: theme.textSecondary }}>{assignment.weightKg} kg · {assignment.requesterName} · {assignment.destination}</span>
            </div>
          </div>

          {canComplete && (
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "12px 14px", marginBottom: "14px", color: theme.textPrimary, background: theme.bg }}>
              Traveller contact
              <div style={{ marginTop: "6px", fontSize: "14px", color: theme.textSecondary }}>{assignment.travellerName} · {assignment.volunteerPhone}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {isPending && (
              <>
                <button type="button" onClick={() => onDecline(assignment)} style={{ ...btn("ghost"), flex: 1, minWidth: "140px" }}>
                  Decline
                </button>
                <button type="button" onClick={() => onAccept(assignment)} style={{ ...btn("primary"), flex: 2, minWidth: "180px" }}>
                  Accept assignment
                </button>
              </>
            )}
            {canComplete && (
              <button type="button" onClick={() => onComplete(assignment)} style={{ ...btn("primary"), width: "100%" }}>
                Mark handover complete
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function VolunteerDashboard() {
  const { assignments, availabilityDays, acceptAssignment, declineAssignment, completeAssignment } = useVolunteers();
  const { updateRequestStatus } = useRequests();

  const pendingAssignments = assignments.filter((assignment) => assignment.status === "pending");
  const upcomingAssignments = assignments.filter((assignment) => assignment.status === "confirmed");
  const completedAssignments = assignments.filter((assignment) => assignment.status === "completed");
  const totalKg = completedAssignments.reduce((sum, assignment) => sum + assignment.weightKg, 0);

  return (
    <>
      <div className="volunteer-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px", marginBottom: "18px" }}>
        <Metric label="Pending assignments" value={String(pendingAssignments.length)} sublabel="awaiting response" />
        <Metric label="Upcoming" value={String(upcomingAssignments.length)} sublabel="confirmed handover" />
        <Metric label="Completed" value={String(completedAssignments.length)} sublabel="all time" />
        <Metric label="kg carried" value={String(totalKg)} sublabel="total impact" />
      </div>

      <div className="volunteer-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.92fr)", gap: "18px", alignItems: "start" }}>
        <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "600" }}>Pending — action required</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {pendingAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onAccept={(item) => {
                    acceptAssignment(item.id);
                    if (item.requestId) updateRequestStatus(item.requestId, "waiting");
                  }}
                  onDecline={(item) => {
                    declineAssignment(item.id);
                    if (item.requestId) updateRequestStatus(item.requestId, "waiting");
                  }}
                  onComplete={(item) => {
                    completeAssignment(item.id);
                    if (item.requestId) updateRequestStatus(item.requestId, "inTransit");
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "600" }}>Confirmed — upcoming</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {upcomingAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onAccept={(item) => acceptAssignment(item.id)}
                  onDecline={(item) => declineAssignment(item.id)}
                  onComplete={(item) => {
                    completeAssignment(item.id);
                    if (item.requestId) updateRequestStatus(item.requestId, "inTransit");
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card>
            <div style={{ padding: "18px" }}>
              <div style={{ marginBottom: "14px", fontSize: "16px", fontWeight: "600", color: theme.textPrimary }}>Availability — May 2026</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                  <div key={day} style={{ textAlign: "center", fontSize: "11px", color: theme.textTertiary }}>{day}</div>
                ))}
                {Array.from({ length: 31 }, (_, index) => {
                  const day = index + 1;
                  const active = availabilityDays.includes(day);
                  return (
                    <div
                      key={day}
                      style={{
                        height: "34px",
                        borderRadius: "10px",
                        background: active ? "#EAF3DB" : "transparent",
                        border: active ? "1px solid #D6E7B3" : `1px solid ${theme.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        color: active ? "#516827" : theme.textSecondary,
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <Link to="/volunteer/availability" style={{ ...btn("ghost"), display: "block", marginTop: "18px", textAlign: "center", textDecoration: "none" }}>
                Update availability
              </Link>
            </div>
          </Card>

          <Card>
            <div style={{ padding: "18px" }}>
              <div style={{ marginBottom: "14px", fontSize: "16px", fontWeight: "600", color: theme.textPrimary }}>Recent contributions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {completedAssignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", color: theme.textPrimary }}>{assignment.item} · {assignment.destination}</div>
                      <div style={{ marginTop: "3px", fontSize: "12px", color: theme.textTertiary }}>{assignment.dateLabel} · {assignment.weightKg} kg</div>
                    </div>
                    <Badge color="#547B30" bg="#E8F2D8">Done</Badge>
                  </div>
                ))}
              </div>

              <Link to="/volunteer/history" style={{ ...btn("ghost"), display: "block", marginTop: "18px", textAlign: "center", textDecoration: "none" }}>
                View full history
              </Link>
            </div>
          </Card>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .volunteer-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .volunteer-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .volunteer-metrics {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
