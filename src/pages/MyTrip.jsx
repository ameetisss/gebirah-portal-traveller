import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import ConfirmModal from "../components/ConfirmModal";
import { Card, CardHeader, Badge, StatusDot, FieldLabel } from "../components/UIKit";
import { theme, btn, inputStyle } from "../theme";
import { useTrip, STAGES, DEMO_MATCH, DEMO_ARRIVAL, DEMO_HANDOVER } from "../context/TripContext";

const STAGE_ORDER = [STAGES.AWAITING, STAGES.MATCH, STAGES.HANDOVER, STAGES.DEPARTED, STAGES.ARRIVAL, STAGES.COMPLETED];

// ── Stage 1: Register ──────────────────────────────────────────

function RegisterView({ onSubmit }) {
  const [form, setForm] = useState({ destination: "", flight: "", date: "", weight: "", departure_time: "" });
  const [isSearching, setIsSearching] = useState(false);
  const [flightOptions, setFlightOptions] = useState([]);
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.destination && form.flight && form.date && form.weight;

  useEffect(() => {
    if (form.flight.length > 2 && form.date) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        fetch("http://localhost:8000/api/flight-departure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flight_number: form.flight.replace(/\s+/g, "").toUpperCase(), date: form.date })
        })
        .then(res => res.json())
        .then(data => {
          setIsSearching(false);
          if (data.status === "success" && data.flights && data.flights.length > 0) {
            setFlightOptions(data.flights);
            const bestFlight = data.flights[0];
            setForm(prev => ({
              ...prev,
              destination: `${bestFlight.destination_country} (${bestFlight.arrival_airport})`,
              departure_time: bestFlight.departure_time
            }));
          } else {
            setFlightOptions([]);
          }
        })
        .catch(err => {
          console.error("Flight lookup error:", err);
          setIsSearching(false);
        });
      }, 500); // Small debounce
      return () => clearTimeout(timer);
    } else {
      setFlightOptions([]);
      setIsSearching(false);
    }
  }, [form.flight, form.date]);

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>Register a trip</div>
        <div style={{ fontSize: "13px", color: theme.textSecondary }}>Tell us about your journey and how much spare baggage you have</div>
      </div>
      <Card>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div>
            <FieldLabel>Flight number</FieldLabel>
            <input type="text" placeholder="e.g. SQ 417"
              value={form.flight} onChange={e => set("flight", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Departure date</FieldLabel>
            <input type="date" placeholder="DD / MM / YYYY"
              value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
          </div>
          
          {isSearching && (
            <div style={{ fontSize: "12px", color: theme.textSecondary, fontStyle: "italic" }}>
              Searching for flight details...
            </div>
          )}

          {flightOptions.length > 1 && (
            <div style={{ background: theme.accentDim, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
              <FieldLabel>Select Departure Time</FieldLabel>
              <select 
                style={{ ...inputStyle, marginBottom: "0", marginTop: "8px" }}
                value={form.departure_time || ""}
                onChange={e => {
                  const selected = flightOptions.find(f => f.departure_time === e.target.value);
                  if (selected) {
                    setForm(prev => ({
                      ...prev,
                      departure_time: selected.departure_time,
                      destination: `${selected.destination_country} (${selected.arrival_airport})`
                    }));
                  }
                }}
              >
                {flightOptions.map((f, i) => (
                  <option key={i} value={f.departure_time}>{f.departure_time} - Arriving in {f.arrival_airport}</option>
                ))}
              </select>
            </div>
          )}
          
          {flightOptions.length === 1 && !isSearching && (
            <div style={{ fontSize: "12px", color: theme.green, background: theme.greenDim, padding: "8px", borderRadius: "4px", border: `1px solid ${theme.green}40` }}>
              ✓ Flight found: Departs at {flightOptions[0].departure_time}
            </div>
          )}

          <div>
            <FieldLabel>Destination</FieldLabel>
            <input type="text" placeholder="e.g. Amman, Jordan"
              value={form.destination} onChange={e => set("destination", e.target.value)} style={inputStyle} />
          </div>

          <div>
            <FieldLabel>Spare baggage (kg)</FieldLabel>
            <input type="number" placeholder="0.0" min="0" step="0.5"
              value={form.weight} onChange={e => set("weight", e.target.value)} style={inputStyle} />
          </div>

          <button style={{ ...btn("primary"), marginTop: "4px", opacity: valid ? 1 : 0.4 }}
            disabled={!valid} onClick={() => valid && onSubmit(form)}>
            Submit trip
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Stage 2: Awaiting Match ────────────────────────────────────

function AwaitingView({ trip, onMatchFound }) {
  const TOTAL = 8;
  const [seconds, setSeconds] = useState(TOTAL);

  useEffect(() => {
    if (seconds <= 0) { onMatchFound(); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>Trip registered</div>
        <div style={{ fontSize: "13px", color: theme.textSecondary }}>We're matching your spare capacity with items that need to travel</div>
      </div>

      <Card style={{ marginBottom: "16px" }}>
        <CardHeader title="Your trip" right={<Badge color={theme.green} bg={theme.greenDim}><StatusDot color={theme.green} />Registered</Badge>} />
        <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {[
            { label: "Destination",    value: trip.destination },
            { label: "Flight",         value: trip.flight },
            { label: "Departure",      value: trip.date },
            { label: "Spare capacity", value: `${trip.weight} kg` },
          ].map(d => (
            <div key={d.label}>
              <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "3px" }}>{d.label}</div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: theme.textPrimary }}>{d.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ position: "relative", width: "64px", height: "64px", margin: "0 auto 20px" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${theme.accent}`, animation: "pulse-ring 1.8s ease-out infinite" }} />
            <div style={{ position: "absolute", inset: "8px", borderRadius: "50%", background: theme.accentDim, border: `2px solid ${theme.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>&#8987;</div>
          </div>
          <div style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.3px", marginBottom: "6px" }}>Searching for matches...</div>
          <div style={{ fontSize: "12px", color: theme.textSecondary, lineHeight: "1.7", marginBottom: "20px" }}>
            Gebirah is finding items heading to {trip.destination}<br />
            that fit within your {trip.weight} kg of spare capacity
          </div>
          <div style={{ background: theme.border, borderRadius: "4px", height: "4px", overflow: "hidden", marginBottom: "8px" }}>
            <div style={{ height: "100%", width: `${((TOTAL - seconds) / TOTAL) * 100}%`, background: theme.accent, borderRadius: "4px", transition: "width 1s linear" }} />
          </div>
          <div style={{ fontSize: "11px", color: theme.textTertiary }}>Demo · match arriving in {seconds}s</div>
          <button style={{ ...btn("ghost"), marginTop: "16px", fontSize: "12px" }} onClick={onMatchFound}>Skip &rarr;</button>
        </div>
      </Card>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.9);  opacity: 0.5; }
          50%  { transform: scale(1.15); opacity: 0.1; }
          100% { transform: scale(0.9);  opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ── Stage 3: Match Received ────────────────────────────────────

function MatchView({ trip, match, onAccept, onDecline }) {
  return (
    <div style={{ maxWidth: "520px", margin: "0 auto" }}>
      <div style={{ background: theme.accentDim, border: `1px solid ${theme.accent}40`, borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <span style={{ fontSize: "22px" }}>&#128236;</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: theme.accent, marginBottom: "2px" }}>New match found</div>
          <div style={{ fontSize: "12px", color: theme.textSecondary }}>A request matches your trip to {trip.destination}</div>
        </div>
      </div>

      <Card>
        <CardHeader title="Match request" right={<Badge color={theme.amber} bg={theme.amberDim}>Awaiting response</Badge>} />
        <div style={{ padding: "20px" }}>
          <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "16px", marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "8px" }}>Item to carry</div>
            <div style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "-0.4px", marginBottom: "4px" }}>{match.item}</div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "16px" }}>{match.description}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {[
                { label: "Weight",       value: `${match.weight} kg` },
                { label: "Destination",  value: match.destination },
                { label: "Requested by", value: match.requester },
              ].map(d => (
                <div key={d.label}>
                  <div style={{ fontSize: "10px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "3px" }}>{d.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: theme.greenDim, border: `1px solid ${theme.green}40`, borderRadius: "8px", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", color: theme.textSecondary }}>Fits within your capacity</span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: theme.green }}>{match.weight} kg of {trip.weight} kg used</span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{ ...btn("ghost"), flex: 1 }} onClick={onDecline}>Decline</button>
            <button style={{ ...btn("primary"), flex: 2 }} onClick={onAccept}>Accept match</button>
          </div>
          <div style={{ fontSize: "11px", color: theme.textTertiary, textAlign: "center", marginTop: "10px" }}>
            You have 24 hours to respond before this match expires
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Stage 4: Handover Brief ────────────────────────────────────

function HandoverView({ trip, handover, onConfirm, onViewTrips }) {
  return (
    <div style={{ maxWidth: "580px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>Handover brief</div>
        <div style={{ fontSize: "13px", color: theme.textSecondary }}>Your match is confirmed — here's everything you need for the handover</div>
      </div>

      {/* Volunteer */}
      <Card style={{ marginBottom: "14px" }}>
        <CardHeader title="Volunteer contact" />
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: theme.tealDim, border: `2px solid ${theme.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: theme.teal, flexShrink: 0 }}>
            {handover.volunteerInitials}
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: theme.textPrimary, marginBottom: "3px" }}>{handover.volunteer}</div>
            <div style={{ fontSize: "13px", color: theme.textSecondary }}>{handover.volunteerPhone}</div>
          </div>
        </div>
      </Card>

      {/* Items */}
      <Card style={{ marginBottom: "14px" }}>
        <CardHeader title="Items to carry" right={<Badge color={theme.accent} bg={theme.accentDim}>{handover.totalWeight} kg total</Badge>} />
        <div style={{ padding: "0 20px" }}>
          {handover.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < handover.items.length - 1 ? `1px solid ${theme.border}` : "none" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary, marginBottom: "2px" }}>{item.name}</div>
                <div style={{ fontSize: "11px", color: theme.textSecondary }}>{item.description} &middot; for {item.requester}</div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: theme.textSecondary }}>{item.weight} kg</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Meet-up details */}
      <Card style={{ marginBottom: "20px" }}>
        <CardHeader title="Meet-up details" />
        <div style={{ padding: "20px" }}>
          <div style={{ background: theme.accentDim, border: `1px solid ${theme.accent}40`, borderRadius: "10px", padding: "16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", color: theme.accentLight, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600", marginBottom: "4px" }}>When</div>
              <div style={{ fontSize: "20px", fontWeight: "600", color: theme.textPrimary, letterSpacing: "-0.5px" }}>{handover.date} &middot; {handover.time}</div>
            </div>
            <Badge color={theme.amber} bg={theme.amberDim}>Upcoming</Badge>
          </div>
          {[
            { label: "Location", value: handover.location, icon: "&#128205;" },
            { label: "Landmark", value: handover.landmark, icon: "&#127991;" },
          ].map((d, i, arr) => (
            <div key={d.label} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : "none" }}>
              <span style={{ fontSize: "16px", marginTop: "1px" }} dangerouslySetInnerHTML={{ __html: d.icon }} />
              <div>
                <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "3px" }}>{d.label}</div>
                <div style={{ fontSize: "13px", color: theme.textPrimary }}>{d.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <button style={{ ...btn("primary"), width: "100%", padding: "12px", fontSize: "14px" }} onClick={onConfirm}>
        Confirm pickup
      </button>
      <button style={{ ...btn("ghost"), width: "100%", marginTop: "10px" }} onClick={onViewTrips}>
        View other trips
      </button>
      <div style={{ fontSize: "11px", color: theme.textTertiary, textAlign: "center", marginTop: "10px" }}>
        Tap confirm after you've received all items from {handover.volunteer} before boarding
      </div>
    </div>
  );
}

// ── Stage 5: Departed (en route) ───────────────────────────────────

function DepartedView({ trip, handover, arrival, onLanded }) {
  return (
    <div style={{ maxWidth: "520px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>&#9992;</div>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "6px" }}>You're on your way!</div>
        <div style={{ fontSize: "13px", color: theme.textSecondary, lineHeight: "1.7" }}>
          {handover.totalWeight} kg picked up &middot; En route to {trip.destination}<br />
          Tap below once you've landed
        </div>
      </div>

      {/* What happens next */}
      <Card style={{ marginBottom: "14px" }}>
        <CardHeader title="On arrival" right={<Badge color={theme.amber} bg={theme.amberDim}>Pending</Badge>} />
        <div style={{ padding: "20px" }}>
          <div style={{ fontSize: "13px", color: theme.textSecondary, lineHeight: "1.7", marginBottom: "16px" }}>
            When you land in {trip.destination}, a local volunteer will meet you at the arrivals hall to collect the items.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", background: theme.surface, borderRadius: "10px", border: `1px solid ${theme.border}` }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: theme.tealDim, border: `2px solid ${theme.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: theme.teal, flexShrink: 0 }}>
              {arrival.volunteerInitials}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: theme.textPrimary, marginBottom: "2px" }}>{arrival.volunteer}</div>
              <div style={{ fontSize: "12px", color: theme.textSecondary }}>{arrival.volunteerPhone}</div>
              <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "2px" }}>{arrival.location}</div>
            </div>
          </div>
        </div>
      </Card>

      <button style={{ ...btn("primary"), width: "100%", padding: "12px", fontSize: "14px" }} onClick={onLanded}>
        I've landed — start arrival handover
      </button>
    </div>
  );
}

// ── Stage 6: Arrival Handover ─────────────────────────────────

function ArrivalView({ trip, arrival, onConfirm }) {
  const [checked, setChecked] = useState(Object.fromEntries(arrival.items.map((_, i) => [i, false])));
  const allChecked = Object.values(checked).every(Boolean);

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>Arrival handover</div>
        <div style={{ fontSize: "13px", color: theme.textSecondary }}>Hand over the items to the local volunteer to complete the request</div>
      </div>

      {/* Local volunteer */}
      <Card style={{ marginBottom: "14px" }}>
        <CardHeader title="Local volunteer" />
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: theme.tealDim, border: `2px solid ${theme.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: theme.teal, flexShrink: 0 }}>
            {arrival.volunteerInitials}
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: theme.textPrimary, marginBottom: "3px" }}>{arrival.volunteer}</div>
            <div style={{ fontSize: "13px", color: theme.textSecondary }}>{arrival.volunteerPhone}</div>
          </div>
        </div>
      </Card>

      {/* Meet-up point */}
      <Card style={{ marginBottom: "14px" }}>
        <CardHeader title="Meet-up point" />
        <div style={{ padding: "20px" }}>
          {[
            { label: "Location", value: arrival.location,  icon: "&#128205;" },
            { label: "Landmark", value: arrival.landmark, icon: "&#127991;" },
          ].map((d, i, arr) => (
            <div key={d.label} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : "none" }}>
              <span style={{ fontSize: "16px", marginTop: "1px" }} dangerouslySetInnerHTML={{ __html: d.icon }} />
              <div>
                <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "3px" }}>{d.label}</div>
                <div style={{ fontSize: "13px", color: theme.textPrimary }}>{d.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Items checklist */}
      <Card style={{ marginBottom: "20px" }}>
        <CardHeader title="Items to hand over" right={<Badge color={theme.accent} bg={theme.accentDim}>{arrival.totalWeight} kg</Badge>} />
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {arrival.items.map((item, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: checked[i] ? theme.greenDim : theme.surface, border: `1px solid ${checked[i] ? theme.green + "60" : theme.border}`, borderRadius: "8px", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
            >
              <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${checked[i] ? theme.green : theme.borderLight}`, background: checked[i] ? theme.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                {checked[i] && <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>&#10003;</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary }}>{item.name}</div>
                <div style={{ fontSize: "11px", color: theme.textSecondary }}>{item.weight} kg &middot; {item.requester}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <button
        style={{ ...btn("primary"), width: "100%", padding: "12px", fontSize: "14px", opacity: allChecked ? 1 : 0.4 }}
        disabled={!allChecked}
        onClick={onConfirm}
      >
        Confirm handover — request complete
      </button>
      <div style={{ fontSize: "11px", color: theme.textTertiary, textAlign: "center", marginTop: "10px" }}>
        Check off each item after handing it to {arrival.volunteer}
      </div>
    </div>
  );
}

// ── Stage 7: Completed ────────────────────────────────────────────

function CompletedView({ trip, handover, onReset }) {
  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: theme.greenDim, border: `2px solid ${theme.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "32px" }}>&#10003;</div>
      <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "8px" }}>Request completed!</div>
      <div style={{ fontSize: "13px", color: theme.textSecondary, lineHeight: "1.8", marginBottom: "28px" }}>
        Items delivered to the local volunteer &middot; Gebirah notified<br />
        Thank you for carrying to {trip.destination} &#127881;
      </div>

      <Card style={{ textAlign: "left", marginBottom: "16px" }}>
        <div style={{ padding: "20px" }}>
          <div style={{ fontSize: "11px", color: theme.textTertiary, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>Trip summary</div>
          {[
            { label: "Route",         value: `Singapore \u2192 ${trip.destination}` },
            { label: "Flight",        value: trip.flight },
            { label: "Items delivered", value: handover.items.map(i => i.name).join(", ") },
            { label: "Total weight",  value: `${handover.totalWeight} kg` },
          ].map((d, i, arr) => (
            <div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : "none", fontSize: "13px" }}>
              <span style={{ color: theme.textSecondary }}>{d.label}</span>
              <span style={{ color: theme.textPrimary, fontWeight: "500" }}>{d.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <button style={{ ...btn("ghost"), width: "100%" }} onClick={onReset}>Register another trip</button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────

const STAGE_LABEL = {
  [STAGES.AWAITING]:  "Awaiting match",
  [STAGES.MATCH]:     "Match found",
  [STAGES.HANDOVER]:  "Handover",
  [STAGES.DEPARTED]:  "En route",
  [STAGES.ARRIVAL]:   "Arrival",
  [STAGES.COMPLETED]: "Completed",
};

export default function MyTrip() {
  const navigate = useNavigate();
  const { trips, activeTripId, setActiveTripId, addTrip,
          stage, setStage, tripData, activeHandover, resetTrip, completeTrip } = useTrip();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Show register form when no trips yet, or user clicked + New trip
  const displayRegister = trips.length === 0 || showRegister;

  function handleReset() {
    resetTrip();
  }

  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, color: theme.textPrimary,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", fontSize: "14px", lineHeight: "1.5",
    }}>
      {showConfirm && (
        <ConfirmModal
          items={activeHandover.items}
          onClose={() => { setShowConfirm(false); setStage(STAGES.DEPARTED); }}
        />
      )}

      <Topbar />

      {/* Trip tab strip */}
      {trips.length > 0 && (
        <div style={{
          borderBottom: `1px solid ${theme.border}`,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          overflowX: "auto",
        }}>
          {trips.map(t => {
            const isActive = !showRegister && t.id === (activeTripId ?? trips[0]?.id);
            return (
              <button
                key={t.id}
                style={{
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontWeight: isActive ? "600" : "400",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  color: isActive ? theme.accent : theme.textSecondary,
                  borderBottom: isActive ? `2px solid ${theme.accent}` : "2px solid transparent",
                  marginBottom: "-1px",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
                onClick={() => { setActiveTripId(t.id); setShowRegister(false); }}
              >
                {t.destination} &middot; {STAGE_LABEL[t.stage] ?? t.stage}
              </button>
            );
          })}
          <button
            style={{
              padding: "10px 14px",
              fontSize: "12px",
              fontWeight: showRegister ? "600" : "400",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              color: showRegister ? theme.accent : theme.textSecondary,
              borderBottom: showRegister ? `2px solid ${theme.accent}` : "2px solid transparent",
              marginBottom: "-1px",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
            onClick={() => setShowRegister(true)}
          >
            + New trip
          </button>
        </div>
      )}

      {/* Progress stepper for active trip */}
      {!displayRegister && stage !== STAGES.REGISTER && (
        <div style={{ borderBottom: `1px solid ${theme.border}`, padding: "0 28px", display: "flex", overflowX: "auto" }}>
          {[
            { key: STAGES.AWAITING,  label: "Registered" },
            { key: STAGES.MATCH,     label: "Matched" },
            { key: STAGES.HANDOVER,  label: "Departure" },
            { key: STAGES.DEPARTED,  label: "En route" },
            { key: STAGES.ARRIVAL,   label: "Arrival" },
            { key: STAGES.COMPLETED, label: "Completed" },
          ].map((s, i, arr) => {
            const currentIdx = STAGE_ORDER.indexOf(stage);
            const thisIdx    = STAGE_ORDER.indexOf(s.key);
            const isActive   = stage === s.key;
            const isDone     = currentIdx > thisIdx;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "10px 12px", fontSize: "12px", fontWeight: isActive ? "600" : "400", color: isActive ? theme.accent : isDone ? theme.green : theme.textTertiary, borderBottom: isActive ? `2px solid ${theme.accent}` : "2px solid transparent", marginBottom: "-1px", whiteSpace: "nowrap" }}>
                  {isDone && <span>&#10003;</span>}
                  {s.label}
                </div>
                {i < arr.length - 1 && <span style={{ color: theme.borderLight, fontSize: "12px", padding: "0 2px" }}>&rsaquo;</span>}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 28px" }}>
        {displayRegister && (
          <RegisterView onSubmit={form => { addTrip(form); setShowRegister(false); }} />
        )}
        {!displayRegister && stage === STAGES.AWAITING && (
          <AwaitingView trip={tripData} onMatchFound={() => setStage(STAGES.MATCH)} />
        )}
        {!displayRegister && stage === STAGES.MATCH && (
          <MatchView
            trip={tripData}
            match={DEMO_MATCH}
            onAccept={() => setStage(STAGES.HANDOVER)}
            onDecline={() => setStage(STAGES.AWAITING)}
          />
        )}
        {!displayRegister && stage === STAGES.HANDOVER && (
          <HandoverView
            trip={tripData}
            handover={activeHandover}
            onConfirm={() => setShowConfirm(true)}
            onViewTrips={() => navigate("/history")}
          />
        )}
        {!displayRegister && stage === STAGES.DEPARTED && (
          <DepartedView
            trip={tripData}
            handover={activeHandover}
            arrival={DEMO_ARRIVAL}
            onLanded={() => setStage(STAGES.ARRIVAL)}
          />
        )}
        {!displayRegister && stage === STAGES.ARRIVAL && (
          <ArrivalView
            trip={tripData}
            arrival={DEMO_ARRIVAL}
            onConfirm={() => { completeTrip(); setStage(STAGES.COMPLETED); }}
          />
        )}
        {!displayRegister && stage === STAGES.COMPLETED && (
          <CompletedView trip={tripData} handover={activeHandover} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
