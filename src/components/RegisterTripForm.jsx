import { useState, useEffect } from "react";
import { theme, btn, inputStyle } from "../theme";
import { Card, Badge, FieldLabel } from "./UIKit";

export default function RegisterTripForm({ onSubmit }) {
  const [form, setForm] = useState({ 
    destination: "", 
    flight: "", 
    date: "", 
    weight: "", 
    departure_time: "",
    arrival_airport: "",
    allocationMode: "manual" // "manual" or "auto"
  });
  const [isSearching, setIsSearching] = useState(false);
  const [flightOptions, setFlightOptions] = useState([]);
  const [flightNotFound, setFlightNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A valid flight has been confirmed by the API
  const flightConfirmed = flightOptions.length > 0;

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    // Reset flight status when the user edits flight number or date
    if (k === "flight" || k === "date") {
      setFlightOptions([]);
      setFlightNotFound(false);
    }
  };

  // All fields filled AND a flight was confirmed via API
  const valid = flightConfirmed && form.destination && form.flight && form.date && form.weight;

  useEffect(() => {
    if (form.flight.length > 2 && form.date) {
      setIsSearching(true);
      setFlightNotFound(false);
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
            setFlightNotFound(false);
            const bestFlight = data.flights[0];
            setForm(prev => ({
              ...prev,
              destination: `${bestFlight.destination_country} (${bestFlight.arrival_airport})`,
              arrival_airport: bestFlight.arrival_airport,
              departure_time: bestFlight.departure_time
            }));
          } else {
            setFlightOptions([]);
            setFlightNotFound(true);
            // Clear any previously auto-filled destination
            setForm(prev => ({ ...prev, destination: "", arrival_airport: "", departure_time: "" }));
          }
        })
        .catch(err => {
          console.error("Flight lookup error:", err);
          setIsSearching(false);
          setFlightNotFound(true);
        });
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setFlightOptions([]);
      setFlightNotFound(false);
      setIsSearching(false);
    }
  }, [form.flight, form.date]);

  async function handleSubmit() {
    if (!valid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      // Reset form on success if needed, but usually the parent handles navigation or state update
    } finally {
      setIsSubmitting(false);
    }
  }

  const allocationModes = [
    { 
      key: "manual", 
      label: "I'll select my items", 
      desc: "See all matching requests and pick what you'd like to carry.",
      icon: "📋"
    },
    { 
      key: "auto", 
      label: "Auto-allocate for me", 
      desc: "Skip searching — the system will automatically assign items for you.",
      icon: "⚡"
    }
  ];

  return (
    <Card>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

        <div>
          <FieldLabel>Flight number</FieldLabel>
          <input
            type="text"
            placeholder="e.g. SQ 417"
            value={form.flight}
            onChange={e => set("flight", e.target.value)}
            style={{
              ...inputStyle,
              borderColor: flightNotFound ? "#ef4444" : undefined,
              outline: flightNotFound ? "none" : undefined,
            }}
          />
        </div>

        <div>
          <FieldLabel>Departure date</FieldLabel>
          <input
            type="date"
            value={form.date}
            min="2026-05-01"
            max="2026-05-31"
            onChange={e => set("date", e.target.value)}
            style={{
              ...inputStyle,
              borderColor: flightNotFound ? "#ef4444" : undefined,
            }}
          />
        </div>

        {/* Flight status feedback */}
        {isSearching && (
          <div style={{ fontSize: "12px", color: theme.textSecondary, fontStyle: "italic" }}>
            🔍 Searching for flight details...
          </div>
        )}

        {flightNotFound && !isSearching && (
          <div style={{
            fontSize: "12px", color: "#ef4444",
            background: "#fef2f2", border: "1px solid #fca5a5",
            borderRadius: "6px", padding: "10px 12px",
            display: "flex", alignItems: "flex-start", gap: "8px",
          }}>
            <span style={{ fontSize: "14px", flexShrink: 0 }}>✗</span>
            <span>
              Flight <strong>{form.flight.toUpperCase()}</strong> on <strong>{form.date}</strong> could not be found.
              Please double-check the flight number and departure date.
            </span>
          </div>
        )}

        {flightOptions.length > 1 && !isSearching && (
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
                    destination: `${selected.destination_country} (${selected.arrival_airport})`,
                    arrival_airport: selected.arrival_airport
                  }));
                }
              }}
            >
              {flightOptions.map((f, i) => (
                <option key={i} value={f.departure_time}>{f.departure_time} – Arriving in {f.arrival_airport}</option>
              ))}
            </select>
          </div>
        )}

        {flightOptions.length === 1 && !isSearching && (
          <div style={{ fontSize: "12px", color: theme.green, background: theme.greenDim, padding: "8px 12px", borderRadius: "6px", border: `1px solid ${theme.green}40` }}>
            ✓ Flight found · Departs at {flightOptions[0].departure_time}
          </div>
        )}

        <div>
          <FieldLabel>Destination</FieldLabel>
          <input type="text" placeholder="e.g. Yangon (Myanmar)"
            value={form.destination} onChange={e => set("destination", e.target.value)} style={inputStyle} />
        </div>

        <div>
          <FieldLabel>Spare baggage (kg)</FieldLabel>
          <input type="number" placeholder="0.0" min="0" step="0.5"
            value={form.weight} onChange={e => set("weight", e.target.value)} style={inputStyle} />
        </div>

        <div>
          <FieldLabel>How would you like to match?</FieldLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
            {allocationModes.map(mode => {
              const isActive = form.allocationMode === mode.key;
              return (
                <div 
                  key={mode.key}
                  onClick={() => set("allocationMode", mode.key)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${isActive ? theme.accent : theme.border}`,
                    background: isActive ? theme.accentDim : theme.surface,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    position: "relative"
                  }}
                >
                  {isActive && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", color: theme.accent, fontSize: "14px" }}>✓</div>
                  )}
                  <div style={{ fontSize: "20px" }}>{mode.icon}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: theme.textPrimary, marginBottom: "2px" }}>{mode.label}</div>
                    <div style={{ fontSize: "11px", color: theme.textSecondary, lineHeight: "1.4" }}>{mode.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!flightConfirmed && !isSearching && !flightNotFound && form.flight && form.date && (
          <div style={{ fontSize: "11px", color: theme.textTertiary, fontStyle: "italic" }}>
            Enter a valid flight number and date to verify before submitting.
          </div>
        )}

        <button
          style={{ ...btn("primary"), marginTop: "4px", opacity: (valid && !isSubmitting) ? 1 : 0.4 }}
          disabled={!valid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Checking availability…" : "Submit trip"}
        </button>
      </div>
    </Card>
  );
}
