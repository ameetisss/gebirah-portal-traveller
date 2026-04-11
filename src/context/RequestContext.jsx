import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  createPlaceholderRequesterRequest,
  placeholderRequesterRequests,
  requesterStepTemplates,
} from "../data/requesterData";

const RequestContext = createContext();

export function RequestProvider({ children }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map DB record to Frontend Request format
  const mapDbToRequest = (db) => ({
    id: db.id,
    requesterName: "Global Relief Fund", // Default for now
    title: db.description,
    weightKg: Number(db.weight_kg),
    urgency: db.urgency,
    destination: db.destination,
    statusKey: db.status === "Waiting" ? "waiting" : db.status === "In transit" ? "inTransit" : "delivered",
    submittedLabel: new Date(db.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }),
    steps: db.status === "Waiting" ? requesterStepTemplates.waiting : requesterStepTemplates.inTransit,
    arrival: db.arrival_info 
      ? { type: "expected-arrival", message: db.arrival_info } 
      : { type: "match-pending", message: db.reason || "Awaiting traveller match" }
  });

  useEffect(() => {
    async function fetchRequests() {
      try {
        const url = user?.id 
          ? `http://localhost:8000/api/item-requests?user_id=${user.id}`
          : `http://localhost:8000/api/item-requests`; // Fetch all if no user (for demo)
        
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setRequests(json.data.map(mapDbToRequest));
        }
      } catch (e) {
        console.error("Failed to fetch requests:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [user?.id]);

  async function addRequest(form, requesterName) {
    try {
      const res = await fetch("http://localhost:8000/api/item-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          description: form.description,
          weight: Number(form.weight),
          urgency: form.urgency,
          destination: form.destination,
          reason: form.reason
        }),
      });
      
      if (res.ok) {
        const json = await res.json();
        const newReq = mapDbToRequest(json.data);
        setRequests((current) => [newReq, ...current]);
      }
    } catch (e) {
      console.error("Failed to add request:", e);
      // Fallback to local state if backend fails
      setRequests((current) => [createPlaceholderRequesterRequest(form, requesterName), ...current]);
    }
  }

  async function updateRequestStatus(requestId, statusKey) {
    const patch = { status: statusKey === "inTransit" ? "In transit" : statusKey === "delivered" ? "Delivered" : "Waiting" };
    try {
      const res = await fetch(`http://localhost:8000/api/item-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) console.error("Failed to patch request status");
    } catch (e) {
      console.error(e);
    }
    setRequests((current) => current.map((request) => (
      request.id === requestId ? { ...request, statusKey } : request
    )));
  }

  async function updateRequest(requestId, patch) {
    const dbPatch = {};
    if (patch.statusKey) dbPatch.status = patch.statusKey === "inTransit" ? "In transit" : patch.statusKey === "delivered" ? "Delivered" : "Waiting";
    if (patch.deliveredLabel) dbPatch.deliveredLabel = patch.deliveredLabel;
    if (patch.routeLabel) dbPatch.routeLabel = patch.routeLabel;
    if (patch.deliveryProof) dbPatch.delivery_proof = patch.deliveryProof;

    try {
      const res = await fetch(`http://localhost:8000/api/item-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPatch),
      });
      if (!res.ok) console.error("Failed to patch request");
    } catch (e) {
      console.error(e);
    }
    setRequests((current) => current.map((request) => (
      request.id === requestId ? { ...request, ...patch } : request
    )));
  }

  return (
    <RequestContext.Provider value={{ requests, loading, addRequest, updateRequestStatus, updateRequest }}>
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  return useContext(RequestContext);
}
