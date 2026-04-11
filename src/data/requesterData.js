export const requesterNavItems = [
  {
    path: "/requester",
    label: "My requests",
    match: (location) => location.pathname === "/requester" && location.hash !== "#new-request",
  },
  {
    path: "/requester",
    hash: "#new-request",
    label: "New request",
    match: (location) => location.pathname === "/requester" && location.hash === "#new-request",
  },
  { path: "/request-history", label: "History" },
];

export const requesterStatusMap = {
  inTransit: {
    label: "In transit",
    color: "#3C7F2E",
    bg: "#E5F3D9",
  },
  waiting: {
    label: "Waiting",
    color: "#8A5A16",
    bg: "#F8EBD3",
  },
  delivered: {
    label: "Delivered",
    color: "#3C7F2E",
    bg: "#E5F3D9",
  },
};

export const requesterStepTemplates = {
  inTransit: [
    { key: "submitted", label: "Request submitted", done: true },
    { key: "approved", label: "Approved by coordinator", done: true },
    { key: "matched", label: "Matched to traveller placeholder", done: true },
    { key: "delivered", label: "Delivery to requester pending", done: false },
  ],
  waiting: [
    { key: "submitted", label: "Request submitted", done: true },
    { key: "approved", label: "Awaiting approval", done: false },
    { key: "matched", label: "Awaiting traveller match", done: false },
    { key: "pickup", label: "Airport pickup pending", done: false },
    { key: "delivered", label: "Delivery to requester pending", done: false },
  ],
};

export const placeholderRequesterRequests = [];
export const placeholderRequesterHistory  = [];

export const requesterFormDefaults = {
  description: "",
  weight: "",
  urgency: "High",
  destination: "",
  reason: "",
};

export function formatRequesterMeta(request) {
  return `${request.weightKg} kg · ${request.destination} · ${request.submittedLabel}`;
}

export function formatRequesterArrival(arrival) {
  if (arrival.type === "expected-arrival") {
    return `Expected arrival: ${arrival.dateLabel} · ${arrival.flightCode} via ${arrival.routeLabel}`;
  }

  return arrival.message;
}

export function createPlaceholderRequesterRequest(form, requesterName = "Requester") {
  return {
    id: Date.now(),
    requesterName,
    title: form.description,
    weightKg: Number(form.weight),
    urgency: form.urgency,
    destination: form.destination,
    submittedLabel: "Submitted just now",
    statusKey: "waiting",
    steps: requesterStepTemplates.waiting,
    arrival: form.reason
      ? {
          type: "match-pending",
          message: `Reason captured: ${form.reason}`,
        }
      : {
          type: "match-pending",
          message: `Urgency captured as ${form.urgency.toLowerCase()}. Matching placeholder will update here later.`,
        },
  };
}
