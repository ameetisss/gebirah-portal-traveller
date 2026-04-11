import { createContext, useContext, useState } from "react";

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

const VolunteerContext = createContext();

export function VolunteerProvider({ children }) {
  const [assignments, setAssignments]           = useState([]);
  const [availability, setAvailability]         = useState(initialAvailability);
  const [completedHistory, setCompletedHistory] = useState([]);

  function acceptAssignment(id) {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, stage: V_STAGES.ACCEPTED } : a));
  }

  function declineAssignment(id) {
    setAssignments(prev => prev.filter(a => a.id !== id));
  }

  function startHandover(id) {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, stage: V_STAGES.HANDOVER } : a));
  }

  function confirmHandover(id) {
    setAssignments(prev => {
      const a = prev.find(x => x.id === id);
      if (a) {
        setCompletedHistory(hist => [{
          id:          Date.now(),
          traveller:   a.traveller,
          destination: a.destination,
          date:        new Date().toLocaleDateString('en-GB'),
          items:       a.items.length,
          kg:          a.totalWeight,
          flight:      a.flight,
          itemsList:   a.items,
        }, ...hist]);
      }
      return prev.map(x => x.id === id ? { ...x, stage: V_STAGES.COMPLETED } : x);
    });
  }

  function findMatch() {
    return new Promise(resolve => {
      setTimeout(() => {
        setAssignments(prev => ([
          ...prev,
          { ...DEMO_ASSIGNMENT, id: Date.now(), stage: V_STAGES.PENDING },
          { 
            ...DEMO_ASSIGNMENT, 
            id: Date.now() + 1, 
            stage: V_STAGES.PENDING, 
            flight: "EK 355", 
            traveller: "John D.", 
            travellerInitials: "JD",
            destination: "Gaza, Palestine", 
            totalWeight: 1.8, 
            items: [{ name: "Medical supplies", description: "First aid", weight: 1.8, requester: "Anera", requester: "Anera" }] 
          }
        ]));
        resolve();
      }, 1500);
    });
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
    }}>
      {children}
    </VolunteerContext.Provider>
  );
}

export function useVolunteers() {
  return useContext(VolunteerContext);
}

export const useVolunteer = useVolunteers;
