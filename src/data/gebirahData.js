import { DEMO_HANDOVER, STAGES } from "../context/TripContext";
import { staticHistory } from "./historyData";
import { placeholderRequesterHistory } from "./requesterData";
import { volunteerStatusStyles } from "./volunteerData";

export const gebirahNavItems = [
  {
    path: "/gebirah",
    label: "Dashboard",
    match: (location) => location.pathname === "/gebirah",
  },
  { path: "/gebirah/requests", label: "Requests" },
  { path: "/gebirah/travellers", label: "Travellers" },
  { path: "/gebirah/handovers", label: "Handovers" },
];

export const urgencyStyles = {
  High: { color: "#A24A4A", bg: "#FBE7E4" },
  Medium: { color: "#8A6427", bg: "#F8E8C7" },
  Low: { color: "#6F695F", bg: "#F1ECE4" },
};

export const requestStatusStyles = {
  Waiting: { color: "#8A6427", bg: "#F7EBD5" },
  Matched: { color: "#4A75B5", bg: "#E4EEFF" },
  "In transit": { color: "#547B30", bg: "#E8F2D8" },
};

export const travellerStageStyles = {
  [STAGES.AWAITING]: { label: "Awaiting match", color: "#8A6427", bg: "#F7EBD5" },
  [STAGES.MATCH]: { label: "Matched", color: "#4A75B5", bg: "#E4EEFF" },
  [STAGES.HANDOVER]: { label: "Handover", color: "#4A75B5", bg: "#E4EEFF" },
  [STAGES.DEPARTED]: { label: "In transit", color: "#547B30", bg: "#E8F2D8" },
  [STAGES.ARRIVAL]: { label: "Arrival handover", color: "#547B30", bg: "#E8F2D8" },
  [STAGES.COMPLETED]: { label: "Completed", color: "#547B30", bg: "#E8F2D8" },
};

const MATCHED_STAGES = [STAGES.MATCH, STAGES.HANDOVER];
const IN_TRANSIT_STAGES = [STAGES.DEPARTED, STAGES.ARRIVAL];
const ALLOCATED_STAGES = [STAGES.MATCH, STAGES.HANDOVER, STAGES.DEPARTED, STAGES.ARRIVAL, STAGES.COMPLETED];

function normalizeLocation(value) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function matchesDestination(requestDestination, tripDestination) {
  const requestKey = normalizeLocation(requestDestination);
  const tripKey = normalizeLocation(tripDestination);
  return requestKey.includes(tripKey) || tripKey.includes(requestKey);
}

function getStagePriority(stage) {
  return {
    [STAGES.ARRIVAL]: 5,
    [STAGES.DEPARTED]: 4,
    [STAGES.HANDOVER]: 3,
    [STAGES.MATCH]: 2,
    [STAGES.AWAITING]: 1,
    [STAGES.COMPLETED]: 0,
  }[stage] ?? 0;
}

function getBestMatchingTrip(request, trips) {
  return trips
    .filter((trip) => trip.stage !== STAGES.COMPLETED && matchesDestination(request.destination, trip.destination))
    .sort((left, right) => getStagePriority(right.stage) - getStagePriority(left.stage))[0] ?? null;
}

export function getRequestQueue(requests, trips) {
  return requests
    .filter((request) => request.statusKey !== "delivered")
    .map((request) => {
      const linkedTrip = getBestMatchingTrip(request, trips);
      let status = "Waiting";

      if (request.statusKey === "inTransit") {
        status = "In transit";
      } else if (linkedTrip && IN_TRANSIT_STAGES.includes(linkedTrip.stage)) {
        status = "In transit";
      } else if (linkedTrip && MATCHED_STAGES.includes(linkedTrip.stage)) {
        status = "Matched";
      }

      return {
        id: request.id,
        requester: request.requesterName ?? "Requester",
        item: `${request.title}, ${request.weightKg}kg`,
        destination: request.destination,
        urgency: request.urgency ?? "High",
        status,
        action: status === "Waiting" ? "Match" : status === "In transit" ? "Track" : "View",
        linkedTrip,
      };
    });
}

export function getTravellerRows(trips) {
  return trips
    .filter((trip) => trip.stage !== STAGES.COMPLETED)
    .map((trip) => {
      const reservedKg = ALLOCATED_STAGES.includes(trip.stage) ? DEMO_HANDOVER.totalWeight : 0;
      const capacity = Math.max(Number(trip.weight || 0) - reservedKg, 0);
      return {
        id: trip.id,
        name: trip.travellerName ?? "Traveller",
        destination: trip.destination,
        flight: trip.flight,
        date: trip.date,
        stage: trip.stage,
        reservedKg,
        freeKg: capacity,
      };
    });
}

export function getHandoverRows(trips, assignments = []) {
  const assignmentRows = assignments
    .filter((assignment) => assignment.status === "confirmed" || assignment.status === "completed")
    .map((assignment) => ({
      id: assignment.id,
      time: assignment.time,
      date: assignment.dateLabel,
      location: assignment.location,
      summary: `${assignment.travellerName} \u2190 ${assignment.volunteerName} \u00b7 ${assignment.weightKg}kg`,
      route: assignment.destination,
      borderColor: assignment.status === "completed" ? "#6C8DE8" : "#5CC69C",
      status: volunteerStatusStyles[assignment.status].label,
      volunteerName: assignment.volunteerName,
      requesterName: assignment.requesterName,
    }));

  if (assignmentRows.length > 0) {
    return assignmentRows;
  }

  return trips
    .filter((trip) => [STAGES.HANDOVER, STAGES.DEPARTED, STAGES.ARRIVAL].includes(trip.stage))
    .map((trip) => ({
      id: trip.id,
      time: DEMO_HANDOVER.time,
      date: trip.date,
      location: DEMO_HANDOVER.location,
      summary: `${trip.travellerName ?? "Traveller"} \u2190 ${DEMO_HANDOVER.volunteer} \u00b7 ${DEMO_HANDOVER.totalWeight}kg`,
      route: trip.destination,
      borderColor: trip.stage === STAGES.HANDOVER ? "#5CC69C" : trip.stage === STAGES.DEPARTED ? "#D79A3E" : "#6C8DE8",
      status: travellerStageStyles[trip.stage].label,
      volunteerName: DEMO_HANDOVER.volunteer,
      requesterName: null,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function getGebirahMetrics({ requests, trips, completedTrips, assignments = [] }) {
  const queue = getRequestQueue(requests, trips);
  const deliveredCount = requests.filter((request) => request.statusKey === "delivered").length + placeholderRequesterHistory.length;
  const totalRequestsSeen = queue.length + deliveredCount;
  const fulfillmentRate = totalRequestsSeen === 0 ? 0 : Math.round((deliveredCount / totalRequestsSeen) * 100);
  const liveHandovers = getHandoverRows(trips, assignments);

  return [
    { label: "Pending requests", value: String(queue.filter((request) => request.status === "Waiting").length), sublabel: `${queue.filter((request) => request.urgency === "High" && request.status === "Waiting").length} urgent` },
    { label: "Matched", value: String(queue.filter((request) => request.status === "Matched").length), sublabel: `${getTravellerRows(trips).filter((trip) => MATCHED_STAGES.includes(trip.stage)).length} travellers assigned` },
    { label: "In transit", value: String(queue.filter((request) => request.status === "In transit").length), sublabel: `${liveHandovers.length} live handovers` },
    { label: "Fulfillment rate", value: `${fulfillmentRate}%`, sublabel: "all recorded requests" },
  ];
}

export function getTopTravellerStats(completedTrips) {
  const allTrips = [...completedTrips, ...staticHistory];
  const aggregates = allTrips.reduce((accumulator, trip) => {
    const key = trip.travellerName ?? "Traveller";
    const current = accumulator.get(key) ?? { name: key, trips: 0, kg: 0 };
    current.trips += 1;
    current.kg += Number(trip.kg ?? 0);
    accumulator.set(key, current);
    return accumulator;
  }, new Map());

  return [...aggregates.values()]
    .sort((left, right) => right.trips - left.trips || right.kg - left.kg)
    .slice(0, 3);
}
