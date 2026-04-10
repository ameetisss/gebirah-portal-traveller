import { Card, Badge } from "../components/UIKit";
import { theme } from "../theme";
import { useTrip } from "../context/TripContext";
import { useVolunteers } from "../context/VolunteerContext";
import { getHandoverRows } from "../data/gebirahData";

export default function GebirahHandovers() {
  const { trips } = useTrip();
  const { assignments } = useVolunteers();
  const handovers = getHandoverRows(trips, assignments);

  return (
    <>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600", letterSpacing: "-0.05em" }}>Handovers</h1>
        <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#786F62" }}>
          Departure-side schedules driven by the traveller journeys currently in handover or in-transit stages.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {handovers.length === 0 && (
          <Card>
            <div style={{ padding: "24px", fontSize: "14px", color: theme.textSecondary }}>No handovers are scheduled from current traveller trips.</div>
          </Card>
        )}
        {handovers.map((handover) => (
          <Card key={handover.id}>
            <div style={{ display: "grid", gridTemplateColumns: "5px 1fr" }}>
              <div style={{ background: handover.borderColor }} />
              <div style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontSize: "19px", fontWeight: "600", color: theme.textPrimary, letterSpacing: "-0.03em" }}>
                      {handover.time} · {handover.location}
                    </div>
                    <div style={{ marginTop: "4px", fontSize: "14px", color: theme.textSecondary }}>{handover.date} · Route: {handover.route}</div>
                  </div>
                  <Badge color={theme.textSecondary} bg={theme.surface}>{handover.status}</Badge>
                </div>
                <div style={{ fontSize: "15px", color: theme.textPrimary }}>{handover.summary}</div>
                {handover.requesterName && (
                  <div style={{ marginTop: "6px", fontSize: "13px", color: theme.textSecondary }}>Requester: {handover.requesterName} · Volunteer: {handover.volunteerName}</div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
