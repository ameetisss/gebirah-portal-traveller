import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const STAGES = {
  REGISTER:     "register",
  AWAITING:     "awaiting",
  MATCH:        "match",
  HANDOVER:     "handover",
  DEPARTED:     "departed",
  ARRIVAL:       "arrival",
  COMPLETED:     "completed",
  NO_VOLUNTEER:  "no_volunteer",
  DECLINED:      "declined",
  UNAVAILABLE:   "unavailable",
};

const TripContext = createContext();

export function TripProvider({ children }) {
  const [trips, setTrips]               = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  // Fetch initial data from backend when the component mounts or userId changes
  useEffect(() => {
    async function fetchData() {
      if (!userId) {
        setTrips([]);
        setCompletedTrips([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/trips/history?traveller_id=${userId}`);
        if (res.ok) {
          const result = await res.json();
          // Map database fields to frontend expectations
          const allTrips = result.data.map(t => ({
            id: t.trips_id,
            destination: t.destination,
            flight: t.flight_number,
            date: t.departure_date,
            weight: t.declared_capacity_kg,
            stage: t.status,
            handoverData: t.handover_data,
            matchData: t.match_data,
            arrivalData: t.arrival_data,
            candidateMatches: t.candidate_matches,
            ...t
          }));
          
          const historyStatuses = ["completed", "declined", "unavailable", "no_volunteer"];
          setTrips(allTrips.filter(t => !historyStatuses.includes(t.status)));
          setCompletedTrips(allTrips.filter(t => historyStatuses.includes(t.status)).map(t => ({
             ...t,
             itemsList: t.match_data || [],
             kg: t.allocated_capacity_kg || (t.match_data ? t.match_data.reduce((s, i) => s + i.weight, 0) : 0),
             route: `Singapore \u2192 ${t.destination}`,
             items: t.match_data ? t.match_data.length : 0,
             departureVolunteer: t.handover_data?.volunteer || "Unknown",
             arrivalVolunteer:   t.arrival_data?.volunteer || "Unknown",
          })));
        }
      } catch (err) {
        console.error("Failed to fetch trip history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  // Active trip: prefer activeTripId, fall back to first trip
  const activeTrip = trips.find(t => t.id === activeTripId) ?? trips[0] ?? null;

  const stage = activeTrip?.stage ?? STAGES.REGISTER;
  const matchAccepted = activeTrip
    ? [STAGES.HANDOVER, STAGES.DEPARTED, STAGES.ARRIVAL, STAGES.COMPLETED].includes(activeTrip.stage)
    : false;
    
  const activeHandover = activeTrip?.handoverData || null;
  const activeMatch = activeTrip?.matchData || null;
  const activeArrival = activeTrip?.arrivalData || null;

  async function addTrip(formData) {
    // departure_time may be a full datetime string like "2026-05-01 13:15"
    // or just a time like "13:15". Extract only HH:MM to build a clean ISO string.
    const rawTime = formData.departure_time || "00:00";
    const timeStr = rawTime.includes(" ") ? rawTime.split(" ")[1] : rawTime;
    let isoDatetime = `${formData.date}T${timeStr}:00`;

    let initialStage = STAGES.AWAITING;
    let handoverData = null;
    let matchData = null;
    let arrivalData = null;
    
    try {
      // 1. Fetch hand-over volunteer (SG departure)
      const vRes = await fetch(`http://localhost:8000/api/volunteers/lookup?datetime=${encodeURIComponent(isoDatetime)}`);
      if (vRes.ok) {
        const vData = await vRes.json();
        initialStage = vData.status === "available" ? STAGES.AWAITING : STAGES.NO_VOLUNTEER;
        if (vData.data) {
           handoverData = { ...vData.data, time: timeStr, date: formData.date };
        }
      }

      // 2. Fetch match from item_requests (prioritized)
      const mRes = await fetch(`http://localhost:8000/api/matches/generate?weight=${formData.weight || 2.0}&destination=${encodeURIComponent(formData.destination)}`);
      if (mRes.ok) {
        const mJson = await mRes.json();
        matchData = mJson.data;
      }

      // 3. Fetch arrival overseas volunteer
      const aRes = await fetch(`http://localhost:8000/api/overseas-volunteer?destination=${encodeURIComponent(formData.destination)}`);
      if (aRes.ok) {
        const aJson = await aRes.json();
        arrivalData = aJson.data;
      }

      // 3. (Internal) Auto-allocate logic
      if (formData.allocationMode === "auto" && matchData && matchData.length > 0) {
        // Simple strategy: take the first item that fits
        const firstMatch = matchData[0];
        if (firstMatch.weight <= formData.weight) {
          const selectedItems = [firstMatch];
          const totalWeight = firstMatch.weight;
          
          initialStage = STAGES.HANDOVER;
          // Finalize match data immediately
          const finalizedMatchData = selectedItems;
          
          // Update handover/arrival summaries with the auto-selected item
          if (handoverData) {
            handoverData.items = finalizedMatchData;
            handoverData.totalWeight = totalWeight;
          }
          if (arrivalData) {
            arrivalData.items = finalizedMatchData;
            arrivalData.totalWeight = totalWeight;
          }

          // 4. Register trip in backend with final state
          const res = await fetch("http://localhost:8000/api/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               ...formData, 
               status: initialStage, 
               traveller_id: userId,
               handover_data: handoverData,
               arrival_data: arrivalData,
               candidate_matches: matchData,
               match_data: finalizedMatchData,
               allocated_capacity_kg: totalWeight
            }),
          });

          if (res.ok) {
            const result = await res.json();
            const newTrip = {
              id: result.data.trips_id,
              ...formData,
              stage: initialStage,
              handoverData,
              candidateMatches: matchData,
              matchData: finalizedMatchData,
              arrivalData,
              ...result.data
            };
            setTrips(prev => [...prev, newTrip]);
            setActiveTripId(newTrip.id);
            return; // Exit
          }
        }
      }

      // 4. Normal flow (Manual allocation or no items found)
      const res = await fetch("http://localhost:8000/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ...formData, 
            status: initialStage === STAGES.NO_VOLUNTEER ? "unavailable" : initialStage, 
            traveller_id: userId,
            handover_data: handoverData,
            arrival_data: arrivalData,
            candidate_matches: matchData // Initial pool of up to 3
         }),
      });

      if (res.ok) {
        const result = await res.json();
        const newTrip = {
          id: result.data.trips_id,
          ...formData,
          stage: initialStage,
          status: result.data.status, // Ensure status from DB is preserved
          handoverData,
          candidateMatches: matchData, // Now an array of up to 3 candidates
          matchData: null,             // Selected items will go here
          arrivalData,
          ...result.data
        };
        setTrips(prev => [...prev, newTrip]);
        setActiveTripId(newTrip.id);
      }
    } catch (err) {
      console.error("Error adding trip:", err);
    }
  }

  function setStage(newStage) {
    if (!activeTrip) return;
    setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, stage: newStage } : t));
  }

  async function confirmMatches(selectedIndices) {
    if (!activeTrip || !activeTrip.candidateMatches) return;
    
    const selectedItems = activeTrip.candidateMatches.filter((_, i) => selectedIndices.includes(i));
    const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);

    try {
      const res = await fetch(`http://localhost:8000/api/trips/${activeTrip.id}/confirm-matches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          matches: selectedItems,
          total_weight: totalWeight
        })
      });

      if (res.ok) {
        const result = await res.json();
        // Update local state with the returned updated trip row
        setTrips(prev => prev.map(t => {
          if (t.id === activeTrip.id) {
            return { 
              ...t, 
              matchData: selectedItems, 
              handoverData: { ...t.handoverData, items: selectedItems, totalWeight },
              arrivalData: { ...t.arrivalData, items: selectedItems, totalWeight },
              stage: STAGES.HANDOVER 
            };
          }
          return t;
        }));
      }
    } catch (err) {
      console.error("Failed to confirm matches:", err);
    }
  }

  async function updateTripStatus(tripId, newStatus) {
    try {
      const res = await fetch(`http://localhost:8000/api/trips/${tripId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatus, stage: newStatus } : t));
      }
    } catch (err) {
      console.error("Failed to update trip status:", err);
    }
  }

  function setStageForTrip(tripId, newStage) {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, stage: newStage } : t));
  }

  async function completeTrip() {
    if (!activeTrip) return;

    try {
      await fetch(`http://localhost:8000/api/trips/${activeTrip.id}/complete`, { method: "PUT" });
      
      const completed = {
        id: activeTrip.id,
        route: `SG \u2192 ${activeTrip.destination}`,
        date: activeTrip.date,
        flight: activeTrip.flight,
        destination: activeTrip.destination,
        items: activeTrip.matchData ? activeTrip.matchData.length : 0,
        kg: activeTrip.matchData ? activeTrip.matchData.reduce((sum, i) => sum + i.weight, 0) : 0,
        itemsList: Array.isArray(activeTrip.matchData) ? activeTrip.matchData : (activeTrip.matchData ? [activeTrip.matchData] : []),
        departureVolunteer: activeTrip.handoverData?.volunteer || "Unknown",
        arrivalVolunteer:   activeTrip.arrivalData?.volunteer || "Unknown",
        status: "completed"
      };
      setCompletedTrips(prev => [completed, ...prev]);
      setTrips(prev => prev.filter(t => t.id !== activeTrip.id));
      setActiveTripId(null);
    } catch (e) {
      console.error("Could not complete trip:", e);
    }
  }

  function resetTrip() {
    if (!activeTrip) return;
    
    // If it's a "no availability" or "declined" trip, move it to history locally
    const historyStatuses = ["unavailable", "declined", "no_volunteer"];
    if (historyStatuses.includes(activeTrip.status)) {
      const historyItem = {
        ...activeTrip,
        id: activeTrip.id,
        kg: activeTrip.allocated_capacity_kg || (activeTrip.matchData ? activeTrip.matchData.reduce((s, i) => s + i.weight, 0) : 0),
        route: `Singapore \u2192 ${activeTrip.destination}`,
        items: activeTrip.matchData ? activeTrip.matchData.length : 0,
        itemsList: activeTrip.matchData || [],
        departureVolunteer: activeTrip.handoverData?.volunteer || "Unknown",
        arrivalVolunteer:   activeTrip.arrivalData?.volunteer || "Unknown",
      };
      setCompletedTrips(prev => [historyItem, ...prev]);
    }
    
    const remaining = trips.filter(t => t.id !== activeTrip.id);
    setTrips(remaining);
    setActiveTripId(remaining[0]?.id ?? null);
  }

  return (
    <TripContext.Provider value={{
      trips, activeTripId, setActiveTripId, addTrip,
      setStageForTrip,
      tripData: activeTrip, stage, setStage,
      confirmMatches,
      matchAccepted, activeHandover, activeMatch, activeArrival,
      completedTrips, completeTrip, resetTrip,
      updateTripStatus,
      loading
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
