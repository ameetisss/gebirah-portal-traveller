import { useState, useContext } from "react";
import { theme, container, btn } from "../theme";
import { Card, Badge, LoadingState } from "../components/UIKit";
import { TripContext } from "../context/TripContext";

export default function GebirahHandovers() {
  const { trips, loading, dispatchHandoverBrief } = useContext(TripContext);
  const [dispatching, setDispatching] = useState(null);

  const handoverTrips = trips.filter(t => t.status === "handover" || t.status === "in_transit");

  const handleDispatchBrief = async (tripId) => {
    setDispatching(tripId);
    await dispatchHandoverBrief(tripId);
    setDispatching(null);
  };

  if (loading) return <LoadingState />;

  return (
    <div style={container}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Handover Schedule</h1>
        <p style={{ color: theme.textSecondary }}>Manage airport handovers and dispatch briefs</p>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {handoverTrips.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: theme.textSecondary }}>
            No handovers scheduled currently.
          </div>
        ) : handoverTrips.map((trip) => {
          const handover = trip.handoverData || trip.handover_data || {};
          const isDispatched = handover.brief_dispatched || handover.briefDispatched;

          return (
            <Card key={trip.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px" }}>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px", background: "#F5F5F0",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
                  }}>
                    ✈️
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600" }}>{trip.flight || trip.flight_number} to {trip.destination}</h3>
                    <div style={{ fontSize: "14px", color: theme.textSecondary }}>
                      {trip.date || trip.departure_date} · {handover.location || "Terminal Departure Hall"}
                    </div>
                    <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                      <Badge bg="#E8F5E9" color="#2E7D32">
                        {handover.volunteer || "Unassigned"} (Volunteer)
                      </Badge>
                      <Badge bg="#E3F2FD" color="#1976D2">
                        {trip.travellerName || trip.traveller_name || "Traveller"}
                      </Badge>
                      {isDispatched && (
                        <Badge bg="#FFF9C4" color="#FBC02D">Brief Dispatched</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleDispatchBrief(trip.id)}
                    disabled={isDispatched || dispatching === trip.id}
                    style={isDispatched ? btn("secondary") : btn("primary")}
                  >
                    {dispatching === trip.id ? "Sending..." : isDispatched ? "Brief Dispatched" : "Dispatch Brief"}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
