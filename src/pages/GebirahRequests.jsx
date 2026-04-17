import { useState, useContext } from "react";
import { theme, container, btn } from "../theme";
import { Card, Badge, LoadingState } from "../components/UIKit";
import { RequestContext } from "../context/RequestContext";
import { TripContext } from "../context/TripContext";
import MatchDetailsModal from "../components/gebirah/MatchDetailsModal";

export default function GebirahRequests() {
  const { requests, loading, manuallyAssignRequest } = useContext(RequestContext);
  const { trips } = useContext(TripContext);
  const [filter, setFilter] = useState("all");
  
  // State for manual assignment modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [targetTrip, setTargetTrip] = useState(null);

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    if (filter === "urgent") return req.urgency === "High";
    return req.statusKey === filter;
  });

  const handleManualAssign = (request) => {
    setSelectedRequest(request);
    // For demo: pick the first awaiting trip to show in modal
    const candidate = trips.find(t => t.status === "awaiting" && t.destination.includes(request.destination));
    setTargetTrip(candidate || trips[0]);
  };

  const confirmAssignment = async () => {
    if (selectedRequest && targetTrip) {
      await manuallyAssignRequest(selectedRequest.id, targetTrip.id);
      setSelectedRequest(null);
      setTargetTrip(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Request Queue</h1>
          <p style={{ color: theme.textSecondary }}>Review and manage pending aid requests</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setFilter("all")} style={filter === "all" ? btn("primary") : btn("secondary")}>All</button>
          <button onClick={() => setFilter("waiting")} style={filter === "waiting" ? btn("primary") : btn("secondary")}>Pending</button>
          <button onClick={() => setFilter("urgent")} style={filter === "urgent" ? btn("primary") : btn("secondary")}>Urgent</button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        {filteredRequests.map((req) => (
          <Card key={req.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>{req.title}</h3>
                  <Badge 
                    bg={req.urgency === "High" ? "#FFECE3" : "#F0F1F3"} 
                    color={req.urgency === "High" ? "#E54D2E" : "#3B424E"}
                  >
                    {req.urgency}
                  </Badge>
                </div>
                <div style={{ fontSize: "14px", color: theme.textSecondary }}>
                  {req.weightKg}kg · {req.destination} · Sent by {req.requesterName}
                </div>
              </div>
              <div>
                {req.statusKey === "waiting" ? (
                  <button 
                    onClick={() => handleManualAssign(req)}
                    style={btn("secondary")}
                  >
                    Manual Assignment
                  </button>
                ) : (
                  <Badge bg="#E8F5E9" color="#2E7D32">{req.status}</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedRequest && targetTrip && (
        <MatchDetailsModal 
          request={selectedRequest} 
          trip={targetTrip} 
          onClose={() => setSelectedRequest(null)}
          onConfirm={confirmAssignment}
        />
      )}
    </div>
  );
}
