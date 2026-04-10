import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import { Card, Badge } from "../components/UIKit";
import { theme, btn, inputStyle } from "../theme";
import { useRequests } from "../context/RequestContext";
import { useAuth } from "../context/AuthContext";
import { useTrip, STAGES } from "../context/TripContext";
import { getRequestQueue } from "../data/gebirahData";
import {
  formatRequesterArrival,
  formatRequesterMeta,
  requesterFormDefaults,
  requesterNavItems,
  requesterStatusMap,
} from "../data/requesterData";

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

function RequestCard({ request, linkedTrip, onConfirmReceipt }) {
  const status = requesterStatusMap[request.statusKey];
  const [proof, setProof] = useState(null);

  function handleProofSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProof({
      name: file.name,
      url: URL.createObjectURL(file),
    });
  }

  return (
    <Card style={{ background: "#F8F4ED", border: "1px solid #E7DED0", borderRadius: "20px" }}>
      <div style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "19px", fontWeight: "600", letterSpacing: "-0.03em", color: theme.textPrimary, marginBottom: "4px" }}>
              {request.title}
            </div>
            <div style={{ fontSize: "14px", color: "#776F63" }}>{formatRequesterMeta(request)}</div>
          </div>
          <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
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
          {formatRequesterArrival(request.arrival)}
        </div>

        {request.statusKey === "inTransit" && (
          <div style={{ marginTop: "18px", padding: "18px 20px", borderRadius: "16px", background: "#FFF9F0", border: "1px solid #E3D8C7" }}>
            <div style={{ fontSize: "15px", fontWeight: "600", color: theme.textPrimary, marginBottom: "6px" }}>Confirm receipt from traveller</div>
            <div style={{ fontSize: "14px", color: "#776F63", lineHeight: "1.55", marginBottom: "12px" }}>
              Add an optional handover image to confirm the final receipt. {linkedTrip ? `Linked traveller: ${linkedTrip.travellerName} · ${linkedTrip.flight}` : ""}
            </div>
            <label style={{ ...btn("ghost"), display: "inline-flex", alignItems: "center", borderRadius: "12px", background: "#FFFFFF" }}>
              Attach image
              <input type="file" accept="image/*" onChange={handleProofSelect} style={{ display: "none" }} />
            </label>
            {proof && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <img src={proof.url} alt="Receipt proof" style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "10px", border: "1px solid #D9CFBF" }} />
                <div style={{ fontSize: "12px", color: "#776F63" }}>{proof.name}</div>
              </div>
            )}
            <button
              type="button"
              onClick={() => onConfirmReceipt(request, linkedTrip, proof)}
              style={{ ...btn("primary"), marginTop: "14px", width: "100%", borderRadius: "12px", padding: "12px 16px" }}
            >
              Confirm final receipt
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

  const { userName, userId } = useAuth();
  const { requests, addRequest, updateRequest } = useRequests();
  const { trips, setStageForTrip, completeTrip, updateTrip } = useTrip();
  const [backendRequests, setBackendRequests] = useState([]);
  const [form, setForm] = useState(requesterFormDefaults);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  async function fetchRequests() {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/api/item-requests?user_id=${userId || ""}`);
      const result = await res.json();
      if (result.status === "success") {
        const mapped = result.data.map(req => ({
          id: req.id,
          title: req.description,
          weightKg: req.weight_kg,
          destination: req.destination,
          statusKey: req.status === "In transit" ? "inTransit" : "submitted",
          arrival: req.arrival_info || (req.reason ? `Reason: ${req.reason}` : "Coordinator is sourcing a traveller match"),
          steps: req.status === "In transit" ? [
            { label: "Request submitted", done: true },
            { label: "Matched with traveller", done: true },
            { label: "Handover in transit", done: true },
            { label: "Final delivery", done: false },
          ] : [
            { label: "Request submitted", done: true },
            { label: "Matching traveller...", done: false },
          ],
        }));
        setBackendRequests(mapped);
      }
    } catch (e) {
      console.error("Fetch requests error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (location.hash === "#new-request") {
      newRequestRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.description || !form.weight || !form.destination) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("http://localhost:8000/api/item-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          weight_kg: form.weight,
          destination: form.destination,
          urgency: form.urgency,
          reason: form.reason,
          user_id: userId
        })
      });
      const result = await res.json();
      if (result.status === "success") {
        addRequest(form, userName);
        setForm(requesterFormDefaults);
        fetchRequests();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      console.error("Submit request error:", e);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid = form.description && form.weight && form.destination;
  const activeRequests = requests.filter((request) => request.statusKey !== "delivered");
  const requestQueue = getRequestQueue(requests, trips);
  const linkedTripsByRequest = new Map(requestQueue.map((item) => [item.id, item.linkedTrip]));

  function handleConfirmReceipt(request, linkedTrip, proof) {
    const deliveredLabel = "Received just now";
    const routeLabel = linkedTrip
      ? `${linkedTrip.travellerName} · ${linkedTrip.flight} to ${linkedTrip.destination}`
      : "Traveller handover confirmed";

    updateRequest(request.id, {
      statusKey: "delivered",
      deliveredLabel,
      routeLabel,
      deliveryProof: proof,
    });

    if (linkedTrip) {
      updateTrip(linkedTrip.id, { deliveryProof: proof });
      completeTrip(linkedTrip.id, {
        deliveryProof: proof,
        totalWeight: request.weightKg,
        itemsCount: 1,
        itemsList: [{ name: request.title, weight: request.weightKg, requester: request.requesterName }],
      });
      setStageForTrip(linkedTrip.id, STAGES.COMPLETED);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: theme.textPrimary, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <Topbar
        navItems={requesterNavItems}
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

            {isLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: theme.textTertiary }}>Loading your requests...</div>
            ) : (activeRequests.length === 0 && backendRequests.length === 0) ? (
              <div style={{ padding: "60px 40px", textAlign: "center", background: "#F8F4ED", borderRadius: "20px", border: "1px dashed #D9CFBF" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>📦</div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: theme.textPrimary, marginBottom: "8px" }}>No active requests</div>
                <div style={{ fontSize: "14px", color: theme.textSecondary }}>Your submitted requests will appear here once you add them.</div>
              </div>
            ) : (
              [...activeRequests, ...backendRequests].map((request) => (
                <RequestCard 
                  key={request.id} 
                  request={request} 
                  linkedTrip={linkedTripsByRequest.get(request.id)}
                  onConfirmReceipt={handleConfirmReceipt}
                />
              ))
            )}
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
                  disabled={!isValid || isSubmitting}
                  style={{
                    ...btn("ghost"),
                    marginTop: "8px",
                    borderRadius: "16px",
                    padding: "16px 18px",
                    background: "#FFF9F0",
                    border: "1px solid #D9CFBF",
                    color: theme.textPrimary,
                    fontSize: "16px",
                    opacity: (isValid && !isSubmitting) ? 1 : 0.45,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit request"}
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
