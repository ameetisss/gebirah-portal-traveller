import { createContext, useContext, useMemo, useState } from "react";
import {
  defaultAvailabilityDays,
  initialVolunteerAssignments,
} from "../data/volunteerData";

const VolunteerContext = createContext();

export function VolunteerProvider({ children }) {
  const [assignments, setAssignments] = useState(initialVolunteerAssignments);
  const [availabilityDays, setAvailabilityDays] = useState(defaultAvailabilityDays);

  function acceptAssignment(assignmentId) {
    setAssignments((current) => current.map((assignment) => (
      assignment.id === assignmentId ? { ...assignment, status: "confirmed", urgency: "Confirmed" } : assignment
    )));
  }

  function declineAssignment(assignmentId) {
    setAssignments((current) => current.map((assignment) => (
      assignment.id === assignmentId ? { ...assignment, status: "declined", urgency: "Declined" } : assignment
    )));
  }

  function completeAssignment(assignmentId) {
    setAssignments((current) => current.map((assignment) => (
      assignment.id === assignmentId ? { ...assignment, status: "completed", urgency: "Done" } : assignment
    )));
  }

  function toggleAvailability(day) {
    setAvailabilityDays((current) => (
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)
    ));
  }

  const value = useMemo(() => ({
    assignments,
    availabilityDays,
    acceptAssignment,
    declineAssignment,
    completeAssignment,
    toggleAvailability,
  }), [assignments, availabilityDays]);

  return (
    <VolunteerContext.Provider value={value}>
      {children}
    </VolunteerContext.Provider>
  );
}

export function useVolunteers() {
  return useContext(VolunteerContext);
}
