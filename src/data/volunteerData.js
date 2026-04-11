export const volunteerNavItems = [
  {
    path: "/volunteer",
    label: "My assignments",
    match: (location) => location.pathname === "/volunteer",
  },
  { path: "/volunteer/availability", label: "Availability" },
  { path: "/volunteer/history", label: "History" },
];

export const initialVolunteerAssignments = [];

export const defaultAvailabilityDays = [4, 5, 11, 12, 19, 20, 21, 22, 26, 27, 31];

export const volunteerStatusStyles = {
  pending: { color: "#A24A4A", bg: "#FBE7E4", label: "Urgent" },
  confirmed: { color: "#547B30", bg: "#E8F2D8", label: "Confirmed" },
  completed: { color: "#547B30", bg: "#E8F2D8", label: "Done" },
  declined: { color: "#6B645A", bg: "#EDE7DD", label: "Declined" },
};

export function getTripLinkedAssignment(trip, assignments) {
  if (!trip) return null;

  return assignments.find((assignment) => (
    assignment.status !== "declined"
    && (assignment.tripId === trip.id
      || trip.destination.toLowerCase().includes(assignment.destination.toLowerCase())
      || assignment.destination.toLowerCase().includes(trip.destination.toLowerCase()))
  )) ?? null;
}
