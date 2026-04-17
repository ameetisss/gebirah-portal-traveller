import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export const V_STAGES = {
  NONE:      "none",
  PENDING:   "pending",
  ACCEPTED:  "accepted",
  HANDOVER:  "handover",
  COMPLETED: "completed",
};

export const DEMO_ASSIGNMENT = {
  traveller:         "",
  travellerPhone:    "",
  travellerInitials: "",
  flight:            "",
  destination:       "",
  departureDate:     "",
  handoverTime:      "",
  handoverDate:      "",
  handoverLocation:  "",
  handoverLandmark:  "",
  items: [],
  totalWeight: 0,
};

export const STATIC_VOLUNTEER_HISTORY = [];

const VolunteerContext = createContext();

// Weekly recurring availability: day → { morning, afternoon, evening }
const initialAvailability = {
  Mon: { morning: true,  afternoon: false, evening: false },
  Tue: { morning: false, afternoon: false, evening: false },
  Wed: { morning: true,  afternoon: true,  evening: false },
  Thu: { morning: false, afternoon: false, evening: false },
  Fri: { morning: true,  afternoon: true,  evening: true  },
  Sat: { morning: true,  afternoon: false, evening: false },
  Sun: { morning: false, afternoon: false, evening: false },
};

export function VolunteerProvider({ children }) {
  const { userId, isLoggedIn } = useAuth();
  const [assignments, setAssignments]           = useState([]);
  const [availability, setAvailability]         = useState(initialAvailability);
  const [completedHistory, setCompletedHistory] = useState([]);

  const mapTripToAssignment = useCallback((trip) => {
    const isHandover = trip.handover_data?.volunteer_id === userId;
    const data = isHandover ? trip.handover_data : trip.arrival_data;
    
    if (!data) return null;

    // Safety mapping between backend field names and frontend expectations
    return {
      ...data,
      id: trip.trips_id,
      stage: data.stage || V_STAGES.PENDING,
      destination: trip.destination || "Unknown Destination",
      flight: trip.flight_number || "Trip",
      departureDate: trip.departure_date || "TBD",
      items: data.items || [],
      totalWeight: data.totalWeight || data.total_weight || 0,
      
      // Map 'location' to 'handoverLocation' if needed
      handoverLocation: data.handoverLocation || data.location || "Arrival Hall",
      handoverLandmark: data.handoverLandmark || data.landmark || "Pillar 4",
      handoverDate:     data.handoverDate || trip.arrival_date || trip.departure_date || "TBD",
      handoverTime:     data.handoverTime || "TBD",
      
      // Traveller info defaults
      traveller:         data.traveller || "Traveller",
      travellerPhone:    data.travellerPhone || "N/A",
      travellerInitials: data.travellerInitials || (data.traveller ? data.traveller.split(' ').map(n => n[0]).join('').toUpperCase() : "T"),

      // Fields for History and Dashboard
      kg:                data.kg || data.totalWeight || data.total_weight || 0,
      items:             data.items || [], // Restore as array
      date:              data.date || trip.departure_date || "TBD",
    };
  }, [userId]);

  const fetchAssignments = useCallback(async () => {
    if (!isLoggedIn || !userId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/volunteers/assignments?user_id=${userId}`);
      const result = await res.json();
      if (result.status === "success") {
        const all = result.data.map(mapTripToAssignment).filter(a => a !== null);
        setAssignments(all.filter(a => a.stage !== V_STAGES.COMPLETED));
        setCompletedHistory(all.filter(a => a.stage === V_STAGES.COMPLETED));
      }
    } catch (e) {
      console.error("Error fetching assignments:", e);
    }
  }, [isLoggedIn, userId, mapTripToAssignment]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  async function updateStatus(tripId, newStage) {
    try {
      const res = await fetch(`http://localhost:8000/api/volunteers/assignments/${tripId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, volunteer_id: userId })
      });
      const result = await res.json();
      if (result.status === "success") {
        fetchAssignments();
      }
    } catch (e) {
      console.error("Error updating status:", e);
    }
  }

  function acceptAssignment(id) {
    updateStatus(id, V_STAGES.ACCEPTED);
  }

  function declineAssignment(id) {
    // For demo, we just update status to none or remove locally
    updateStatus(id, V_STAGES.NONE);
  }

  function startHandover(id) {
    updateStatus(id, V_STAGES.HANDOVER);
  }

  function confirmHandover(id) {
    updateStatus(id, V_STAGES.COMPLETED);
  }

  function findMatch() {
    // Trigger a refresh to see if any new matches were assigned by the backend
    fetchAssignments();
  }

  function toggleAvailability(day, slot) {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] },
    }));
  }

  const allHistory = [...completedHistory, ...STATIC_VOLUNTEER_HISTORY];
  const totalKgDelivered = allHistory.reduce((s, h) => s + h.kg, 0).toFixed(1);

  return (
    <VolunteerContext.Provider value={{
      assignments,
      availability, toggleAvailability,
      completedHistory, allHistory, totalKgDelivered,
      acceptAssignment, declineAssignment, startHandover, confirmHandover, 
      completeAssignment: confirmHandover, findMatch,
      fetchAssignments,
    }}>
      {children}
    </VolunteerContext.Provider>
  );
}

export function useVolunteers() {
  return useContext(VolunteerContext);
}

export const useVolunteer = useVolunteers;
