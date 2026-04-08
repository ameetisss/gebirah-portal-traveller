import { createContext, useContext, useState } from "react";

export const STAGES = {
  REGISTER:  "register",
  AWAITING:  "awaiting",
  MATCH:     "match",
  HANDOVER:  "handover",   // pre-departure pickup
  DEPARTED:  "departed",   // boarded, en route
  ARRIVAL:   "arrival",    // landed, meet local volunteer
  COMPLETED: "completed",  // request fully done
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

function getExistingCompletedId(tripId, completedTrips) {
  return completedTrips.find((trip) => trip.sourceTripId === tripId)?.id ?? null;
}

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
    ? { ...DEMO_HANDOVER, date: activeTrip.date }
    : DEMO_HANDOVER;

  // Add a new trip (replaces setTripData + setStage(AWAITING))
  function addTrip(formData) {
    const id = Date.now();
    setTrips(prev => [...prev, {
      id,
      travellerName: formData.travellerName ?? "Traveller",
      pickupProof: null,
      deliveryProof: null,
      ...formData,
      stage: STAGES.AWAITING,
    }]);
    setActiveTripId(id);
  }

  function updateTrip(tripId, patch) {
    setTrips((prev) => prev.map((trip) => (
      trip.id === tripId ? { ...trip, ...patch } : trip
    )));
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
  function completeTrip(tripId = activeTrip?.id, extras = {}) {
    const targetTrip = trips.find((trip) => trip.id === tripId);
    if (!targetTrip) return;

    const completedRecord = {
      id: getExistingCompletedId(targetTrip.id, completedTrips) ?? Date.now(),
      sourceTripId: targetTrip.id,
      route: `SG \u2192 ${targetTrip.destination}`,
      date: targetTrip.date,
      flight: targetTrip.flight,
      travellerName: targetTrip.travellerName,
      destination: targetTrip.destination,
      items: extras.itemsCount ?? DEMO_HANDOVER.items.length,
      kg: extras.totalWeight ?? DEMO_HANDOVER.totalWeight,
      itemsList: extras.itemsList ?? DEMO_HANDOVER.items,
      departureVolunteer: extras.departureVolunteer ?? DEMO_HANDOVER.volunteer,
      arrivalVolunteer: extras.arrivalVolunteer ?? DEMO_ARRIVAL.volunteer,
      pickupProof: extras.pickupProof ?? targetTrip.pickupProof ?? null,
      deliveryProof: extras.deliveryProof ?? targetTrip.deliveryProof ?? null,
    };

    setCompletedTrips((prev) => {
      const existingIndex = prev.findIndex((trip) => trip.sourceTripId === targetTrip.id);
      if (existingIndex === -1) return [completedRecord, ...prev];

      const next = [...prev];
      next[existingIndex] = { ...next[existingIndex], ...completedRecord };
      return next;
    });
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
      updateTrip,
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
