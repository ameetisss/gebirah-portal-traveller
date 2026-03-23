import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Topbar from "../components/Topbar";
import { Card, Badge } from "../components/UIKit";
import { theme, btn, inputStyle } from "../theme";

const REQUESTER_NAV_ITEMS = [
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

const REQUEST_STEPS = {
  inTransit: [
    { label: "Request submitted", done: true },
    { label: "Approved by coordinator", done: true },
    { label: "Matched to traveller: Sarah L.", done: true },
    { label: "Delivery to you pending", done: false },
  ],
  waiting: [
    { label: "Request submitted", done: true },
    { label: "Awaiting approval", done: false },
    { label: "Awaiting traveller match", done: false },
    { label: "Airport pickup pending", done: false },
    { label: "Delivery to you pending", done: false },
  ],
};

const INITIAL_REQUESTS = [
  {
    id: 1,
    title: "Medication",
    meta: "0.5 kg · Gaza · Submitted 10 Mar",
    status: "In transit",
    statusColor: "#3C7F2E",
    statusBg: "#E5F3D9",
    steps: REQUEST_STEPS.inTransit,
    arrival: "Expected arrival: 15 Mar · SQ 417 via Amman",
  },
  {
    id: 2,
    title: "Clothing",
    meta: "2 kg · Gaza · Submitted 8 Mar",
    status: "Waiting",
    statusColor: "#8A5A16",
    statusBg: "#F8EBD3",
    steps: REQUEST_STEPS.waiting,
    arrival: "Coordinator is sourcing a traveller match",
  },
];

const EMPTY_FORM = {
  description: "",
  weight: "",
  urgency: "High",
  destination: "",
  reason: "",
};

function RequestStepper({ steps }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <div key={step.label} style={{ display: "grid", gridTemplateColumns: "18px 1fr", columnGap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  marginTop: "5px",
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  background: step.done ? theme.accent : "#fff",
                  border: `2px solid ${step.done ? theme.accent : "#C8C2B9"}`,
                }}
              />
              {!isLast && (
                <span
                  style={{
                    width: "2px",
                    minHeight: "22px",
                    flex: 1,
                    marginTop: "6px",
                    marginBottom: "6px",
                    background: "#E4DED4",
                  }}
                />
              )}
            </div>
            <div
              style={{
                paddingBottom: isLast ? 0 : "8px",
                color: step.done ? theme.textPrimary : "#8F877C",
                fontSize: "15px",
                lineHeight: "1.45",
              }}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RequestCard({ request }) {
  return (
    <Card style={{ background: "#F8F4ED", border: "1px solid #E7DED0", borderRadius: "20px" }}>
      <div style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "19px", fontWeight: "600", letterSpacing: "-0.03em", color: theme.textPrimary, marginBottom: "4px" }}>
              {request.title}
            </div>
            <div style={{ fontSize: "14px", color: "#776F63" }}>{request.meta}</div>
          </div>
          <Badge color={request.statusColor} bg={request.statusBg}>{request.status}</Badge>
        </div>

        <RequestStepper steps={request.steps} />

        <div
          style={{
            marginTop: "18px",
            padding: "18px 20px",
            borderRadius: "16px",
            background: "#F1EBE2",
            color: "#463F35",
            fontSize: "15px",
            lineHeight: "1.45",
            border: "1px solid #E3D8C7",
          }}
        >
          {request.arrival}
        </div>
      </div>
    </Card>
  );
}

export default function RequesterPortal() {
  const location = useLocation();
  const newRequestRef = useRef(null);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (location.hash === "#new-request") {
      newRequestRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.description || !form.weight || !form.destination) return;

    setRequests((current) => [
      {
        id: Date.now(),
        title: form.description,
        meta: `${form.weight} kg · ${form.destination} · Submitted today`,
        status: "Waiting",
        statusColor: "#8A5A16",
        statusBg: "#F8EBD3",
        steps: REQUEST_STEPS.waiting,
        arrival: form.reason
          ? `Reason noted: ${form.reason}`
          : `Urgency marked ${form.urgency.toLowerCase()}. Coordinator is sourcing a traveller match`,
      },
      ...current,
    ]);
    setForm(EMPTY_FORM);
  }

  const isValid = form.description && form.weight && form.destination;

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: theme.textPrimary, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Topbar
        navItems={REQUESTER_NAV_ITEMS}
        homePath="/requester"
        brandLabel="Gebirah portal"
        logoBg="#ECE8FF"
        logoColor="#5D56B5"
        avatarBg="#FBEDE6"
        avatarColor="#9D5D2A"
      />

      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "34px 28px 40px" }}>
        <div className="requester-layout" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.88fr", gap: "28px", alignItems: "start" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "600", letterSpacing: "-0.04em" }}>My requests</h1>
                <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#786F62" }}>
                  Track each stage at a glance instead of chasing manual updates.
                </p>
              </div>
              <a
                href="#new-request"
                style={{
                  ...btn("ghost"),
                  textDecoration: "none",
                  color: theme.textPrimary,
                  border: "1px solid #D9CFBF",
                  background: "#FFF9F0",
                  borderRadius: "16px",
                  padding: "14px 22px",
                }}
              >
                + New request
              </a>
            </div>

            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </section>

          <section id="new-request" ref={newRequestRef}>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600", letterSpacing: "-0.04em" }}>Submit a request</h2>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#786F62" }}>
                Keep it short so Gebirah can filter, match, and reassure quickly.
              </p>
            </div>

            <Card style={{ background: "#F8F4ED", border: "1px solid #E7DED0", borderRadius: "20px" }}>
              <form onSubmit={handleSubmit} style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#776F63" }}>Item description</span>
                  <input
                    value={form.description}
                    onChange={(event) => setField("description", event.target.value)}
                    placeholder="e.g. Children's clothing, 2kg"
                    style={{ ...inputStyle, padding: "16px 18px", borderRadius: "14px", fontSize: "15px", background: "#FFFFFF", border: "1px solid #D9CFBF" }}
                  />
                </label>

                <div className="requester-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#776F63" }}>Weight (kg)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.weight}
                      onChange={(event) => setField("weight", event.target.value)}
                      placeholder="0.0"
                      style={{ ...inputStyle, padding: "16px 18px", borderRadius: "14px", fontSize: "15px", background: "#FFFFFF", border: "1px solid #D9CFBF" }}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#776F63" }}>Urgency</span>
                    <select
                      value={form.urgency}
                      onChange={(event) => setField("urgency", event.target.value)}
                      style={{ ...inputStyle, padding: "16px 18px", borderRadius: "14px", fontSize: "15px", background: "#FFFFFF", border: "1px solid #D9CFBF", appearance: "none" }}
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#776F63" }}>Destination</span>
                  <input
                    value={form.destination}
                    onChange={(event) => setField("destination", event.target.value)}
                    placeholder="City, Country"
                    style={{ ...inputStyle, padding: "16px 18px", borderRadius: "14px", fontSize: "15px", background: "#FFFFFF", border: "1px solid #D9CFBF" }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#776F63" }}>Reason (optional)</span>
                  <textarea
                    value={form.reason}
                    onChange={(event) => setField("reason", event.target.value)}
                    placeholder="Why do you need this item?"
                    rows={5}
                    style={{ ...inputStyle, padding: "16px 18px", borderRadius: "14px", fontSize: "15px", background: "#FFFFFF", border: "1px solid #D9CFBF", resize: "vertical", minHeight: "144px" }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={!isValid}
                  style={{
                    ...btn("ghost"),
                    marginTop: "8px",
                    borderRadius: "16px",
                    padding: "16px 18px",
                    background: "#FFF9F0",
                    border: "1px solid #D9CFBF",
                    color: theme.textPrimary,
                    fontSize: "16px",
                    opacity: isValid ? 1 : 0.45,
                  }}
                >
                  Submit request
                </button>
              </form>
            </Card>
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .requester-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .requester-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
