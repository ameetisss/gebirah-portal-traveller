import { createContext, useContext, useState } from "react";

export const STAGES = {
  REGISTER:     "register",
  AWAITING:     "awaiting",
  MATCH:        "match",
  HANDOVER:     "handover",
  DEPARTED:     "departed",
  ARRIVAL:      "arrival",
  COMPLETED:    "completed",
  NO_VOLUNTEER: "no_volunteer",
};

export const DEMO_MATCH = {
  item: "Clothing",
  description: "Winter clothes for a family \u2014 3 sweaters, 2 jackets",
  requester: "Islamic Relief",
  weight: 2.0,
  destination: "Amman, Jordan",
};

export const DEMO_ARRIVAL = {
  volunteer: "Ahmad R.",
  volunteerInitials: "AR",
  volunteerPhone: "+962 79 123 4567",
  location: "Queen Alia Int'l Airport, Arrivals Hall",
  landmark: "Near exit gate B, holding a Gebirah sign",
  items: [
    { name: "Clothing",   weight: 2.0, requester: "Islamic Relief" },
    { name: "Stationery", weight: 0.8, requester: "Human Appeal" },
  ],
  totalWeight: 2.8,
};

export const DEMO_HANDOVER = {
  volunteer: "Nurul A.",
  volunteerInitials: "NA",
  volunteerPhone: "+65 9123 4567",
  items: [
    { name: "Clothing",   description: "3 sweaters, 2 jackets", weight: 2.0, requester: "Islamic Relief" },
    { name: "Stationery", description: "Notebooks and pens",    weight: 0.8, requester: "Human Appeal" },
  ],
  totalWeight: 2.8,
  location: "T3 Departure Hall, Level 2",
  landmark: "Near check-in row G, next to information counter",
  time: "12:30",
  date: "Today",
};

const TripContext = createContext();

export function TripProvider({ children }) {
  const [trips, setTrips]               = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);

  // Active trip: prefer activeTripId, fall back to first trip
  const activeTrip = trips.find(t => t.id === activeTripId) ?? trips[0] ?? null;

  // Backward-compatible single-trip derived values
  const tripData     = activeTrip;
  const stage        = activeTrip?.stage ?? STAGES.REGISTER;
  const matchAccepted = activeTrip
    ? [STAGES.HANDOVER, STAGES.DEPARTED, STAGES.ARRIVAL, STAGES.COMPLETED].includes(activeTrip.stage)
    : false;
  const activeHandover = activeTrip
    ? { 
        ...DEMO_HANDOVER, 
        volunteer: activeTrip.volunteer_name || DEMO_HANDOVER.volunteer,
        date: activeTrip.date 
      }
    : DEMO_HANDOVER;

  // Add a new trip — calls the backend to check volunteer availability at departure datetime.
  // Returns a promise that resolves when the trip has been added and the stage is set.
  async function addTrip(formData) {
    const id = Date.now();
    // Build an ISO datetime from the form's departure date + time
    let timeStr = formData.departure_time || "00:00";
    let isoDatetime;

    if (timeStr.includes("-") && (timeStr.includes(" ") || timeStr.includes("T"))) {
      // If timeStr already contains a date, just make sure it uses 'T'
      isoDatetime = timeStr.replace(" ", "T");
    } else {
      // Otherwise, combine it with the selected date
      isoDatetime = formData.date ? `${formData.date}T${timeStr}` : new Date().toISOString();
    }

    // Ensure we have seconds at the end if missing (for backend robustness)
    if (isoDatetime.split("T")[1].split(":").length === 2) {
      isoDatetime += ":00";
    }

    let initialStage = STAGES.AWAITING; // safe default
    let volunteerName = null;
    try {
      const res = await fetch(
        `http://localhost:8000/api/volunteers/lookup?datetime=${encodeURIComponent(isoDatetime)}`
      );
      if (res.ok) {
        const data = await res.json();
        initialStage = data.status === "available" ? STAGES.AWAITING : STAGES.NO_VOLUNTEER;
        volunteerName = data.volunteer_name;
      }
    } catch (err) {
      console.warn("Volunteer lookup failed, defaulting to AWAITING:", err);
    }

    setTrips(prev => [...prev, { id, ...formData, stage: initialStage, volunteer_name: volunteerName }]);
    setActiveTripId(id);
  }

  // Update the active trip's stage
  function setStage(newStage) {
    if (!activeTrip) return;
    setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, stage: newStage } : t));
  }

  // Update any specific trip's stage by id
  function setStageForTrip(tripId, newStage) {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, stage: newStage } : t));
  }

  // Save active trip to history (called before setting COMPLETED stage)
  function completeTrip() {
    if (!activeTrip) return;
    setCompletedTrips(prev => [{
      id: Date.now(),
      route: `SG \u2192 ${activeTrip.destination}`,
      date: activeTrip.date,
      flight: activeTrip.flight,
      destination: activeTrip.destination,
      items: DEMO_HANDOVER.items.length,
      kg: DEMO_HANDOVER.totalWeight,
      itemsList: DEMO_HANDOVER.items,
      departureVolunteer: activeTrip.volunteer_name || DEMO_HANDOVER.volunteer,
      arrivalVolunteer:   DEMO_ARRIVAL.volunteer,
    }, ...prev]);
  }

  // Remove the active trip and select the next one
  function resetTrip() {
    if (!activeTrip) return;
    const remaining = trips.filter(t => t.id !== activeTrip.id);
    setTrips(remaining);
    setActiveTripId(remaining[0]?.id ?? null);
  }

  return (
    <TripContext.Provider value={{
      // Multi-trip
      trips, activeTripId, setActiveTripId, addTrip,
      setStageForTrip,
      // Backward-compat single-trip API
      tripData, stage, setStage,
      matchAccepted, activeHandover,
      completedTrips, completeTrip, resetTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
