import { useState } from "react";
import Topbar from "../components/Topbar";
import { Card, Badge } from "../components/UIKit";
import TripDetailModal from "../components/TripDetailModal";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";
import { staticHistory } from "../data/historyData";
import { getTravellerLevelProgress } from "../data/badgeData";

export default function History() {
  const { userName } = useAuth();
  const { completedTrips } = useTrip();
  const allTrips = [...completedTrips];
  const travellerStats = allTrips.filter((trip) => trip.travellerName === userName)
    .reduce((accumulator, trip) => ({ totalTrips: accumulator.totalTrips + 1, totalKg: accumulator.totalKg + Number(trip.kg ?? 0) }), { totalTrips: 0, totalKg: 0 });
  const travellerLevel = getTravellerLevelProgress(travellerStats.totalKg);
  const [selectedTrip, setSelectedTrip] = useState(null);
  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, color: theme.textPrimary,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", fontSize: "14px", lineHeight: "1.5",
    }}>
      {selectedTrip && <TripDetailModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
      <Topbar travellerProgress={travellerLevel} />

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 28px" }}>
        <div style={{ maxWidth: "560px" }}>
          <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>
            Trip history
          </div>
          <div style={{ fontSize: "13px", color: theme.textSecondary, marginBottom: "24px" }}>
            All your previous trips
          </div>

          <Card>
            <div style={{ padding: "0 20px" }}>
              {allTrips.map((trip, i) => (
                <div
                  key={trip.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: i < allTrips.length - 1 ? `1px solid ${theme.border}` : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedTrip(trip)}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: theme.textPrimary, marginBottom: "2px" }}>
                      {trip.route}
                    </div>
                    <div style={{ fontSize: "12px", color: theme.textSecondary }}>
                      {trip.date} &middot; {trip.items} items &middot; {trip.kg} kg
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {trip.status === "declined" ? (
                      <Badge color={theme.red} bg={theme.redDim}>Declined</Badge>
                    ) : (trip.status === "unavailable" || trip.status === "no_volunteer") ? (
                      <Badge color={theme.amber} bg={theme.amberDim}>No Volunteer</Badge>
                    ) : (
                      <Badge color={theme.green} bg={theme.greenDim}>Delivered</Badge>
                    )}
                    <span style={{ fontSize: "16px", color: theme.textTertiary }}>&rsaquo;</span>
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
