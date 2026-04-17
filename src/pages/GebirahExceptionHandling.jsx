import { useState, useContext } from "react";
import { theme, container, btn } from "../theme";
import { Card, Badge, LoadingState } from "../components/UIKit";
import { RequestContext } from "../context/RequestContext";

export default function GebirahExceptionHandling() {
  const { requests, loading, requeueRequest } = useContext(RequestContext);
  const [processing, setProcessing] = useState(null);

  // For exceptions, we look at requests that are 'Matched' or 'In Transit' but might have issues
  const matchedRequests = requests.filter(r => r.statusKey === "matched" || r.statusKey === "inTransit");

  const handleRequeue = async (requestId, reason) => {
    setProcessing(requestId);
    await requeueRequest(requestId, reason);
    setProcessing(null);
  };

  if (loading) return <LoadingState />;

  return (
    <div style={container}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Exception Handling</h1>
        <p style={{ color: theme.textSecondary }}>Manage no-shows, cancellations, and delivery failures</p>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {matchedRequests.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: theme.textSecondary }}>
            No active matches found to manage.
          </div>
        ) : matchedRequests.map((req) => (
          <Card key={req.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>{req.title}</h3>
                  <Badge bg="#FFF9C4" color="#FBC02D">{req.status}</Badge>
                </div>
                <div style={{ fontSize: "14px", color: theme.textSecondary, marginBottom: "12px" }}>
                  Assigned to: {req.arrival_info || "Scanning..."}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Badge bg="#F0F1F3" color="#3B424E">Destination: {req.destination}</Badge>
                  <Badge bg="#F0F1F3" color="#3B424E">Requester: {req.requesterName}</Badge>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={() => handleRequeue(req.id, "No-show")}
                  disabled={processing === req.id}
                  style={btn("secondary")}
                >
                  {processing === req.id ? "Processing..." : "Flag No-Show"}
                </button>
                <button 
                  onClick={() => handleRequeue(req.id, "Cancellation")}
                  disabled={processing === req.id}
                  style={{ ...btn("secondary"), color: "#E54D2E" }}
                >
                  Cancel Match
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
