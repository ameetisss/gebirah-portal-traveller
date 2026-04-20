import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import ConfirmModal from "../components/ConfirmModal";
import { Card, CardHeader, Badge, StatusDot, FieldLabel } from "../components/UIKit";
import { theme, btn, inputStyle } from "../theme";
import { useTrip, STAGES, DEMO_MATCH, DEMO_ARRIVAL, DEMO_HANDOVER } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import { useVolunteers } from "../context/VolunteerContext";
import { useRequests } from "../context/RequestContext";
import { getTripLinkedAssignment } from "../data/volunteerData";
import { getTravellerLevelProgress } from "../data/badgeData";
import { staticHistory } from "../data/historyData";
import RegisterTripForm from "../components/RegisterTripForm";

const STAGE_ORDER = [STAGES.AWAITING, STAGES.MATCH, STAGES.HANDOVER, STAGES.DEPARTED, STAGES.ARRIVAL, STAGES.COMPLETED];

// ── Stage 1: Register ──────────────────────────────────────────


// ── No Volunteer Available ─────────────────────────────────────

function NoVolunteerView({ onReset }) {
  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
      <div style={{
        width: "72px", height: "72px", borderRadius: "50%",
        background: theme.amberDim, border: `2px solid ${theme.amber}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 24px", fontSize: "32px"
      }}>
        🤲
      </div>

      <div style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.5px", marginBottom: "12px" }}>
        Thank You for Your Heart!
      </div>
      <div style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: "1.8", marginBottom: "28px" }}>
        Thank you so much for your interest and willingness to help. Whether we couldn't find a perfect timing match or you've decided to decline the current options, we truly appreciate your heart for this cause.<br /><br />
        It would mean a lot if you followed us to stay in the loop about future opportunities to serve. 🌟
      </div>

      <a
        href="https://www.facebook.com/HELP.GEBIRAH/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "12px 24px", borderRadius: "8px",
          background: "#1877F2", color: "#fff",
          fontWeight: "600", fontSize: "14px",
          textDecoration: "none",
          marginBottom: "16px",
          transition: "opacity 0.15s",
        }}
        onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
        onMouseOut={e => e.currentTarget.style.opacity = "1"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
        Follow us on Facebook
      </a>

      <div>
        <button style={{ ...btn("ghost"), marginTop: "8px" }} onClick={onReset}>
          ← Register another trip
        </button>
      </div>
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

function MatchView({ trip, candidateMatches, onAccept, onDecline }) {
  const [selected, setSelected] = useState(candidateMatches.map((_, i) => i)); // Default select all
  const totalWeight = candidateMatches
    .filter((_, i) => selected.includes(i))
    .reduce((sum, item) => sum + item.weight, 0);

  const toggle = (i) => {
    setSelected(prev => prev.includes(i) ? prev.filter(idx => idx !== i) : [...prev, i]);
  };

  const isOverWeight = totalWeight > trip.weight;

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto" }}>
      <div style={{ background: theme.accentDim, border: `1px solid ${theme.accent}40`, borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <span style={{ fontSize: "22px" }}>&#128236;</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: theme.accent, marginBottom: "2px" }}>New items found</div>
          <div style={{ fontSize: "12px", color: theme.textSecondary }}>Select which items you can carry for your trip to {trip.destination}</div>
        </div>
      </div>

      <Card>
        <CardHeader title="Available matches" right={<Badge color={theme.amber} bg={theme.amberDim}>Selection required</Badge>} />
        <div style={{ padding: "20px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {candidateMatches.map((item, i) => {
              const isActive = selected.includes(i);
              return (
                <div 
                  key={i} 
                  onClick={() => toggle(i)}
                  style={{ 
                    padding: "16px", 
                    border: `1px solid ${isActive ? theme.accent : theme.border}`, 
                    borderRadius: "12px", 
                    background: isActive ? theme.accentDim : theme.surface, 
                    cursor: "pointer", 
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    boxShadow: isActive ? `0 4px 12px ${theme.accent}15` : "none"
                  }}
                >
                  {/* Custom Tickbox */}
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    border: `2px solid ${isActive ? theme.accent : theme.borderLight}`,
                    background: isActive ? theme.accent : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}>
                    {isActive && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: theme.textPrimary }}>{item.name}</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: theme.accent }}>{item.weight} kg</div>
                    </div>
                    <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "4px" }}>{item.description}</div>
                    <div style={{ fontSize: "10px", color: theme.textTertiary, textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.02em" }}>
                      Requested by: {item.requester}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center", 
            padding: "14px", background: isOverWeight ? theme.redDim : theme.greenDim, 
            border: `1px solid ${isOverWeight ? "#ef4444" : theme.green}40`, borderRadius: "10px", marginBottom: "20px" 
          }}>
            <div>
              <div style={{ fontSize: "11px", color: theme.textSecondary }}>Total baggage used</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: isOverWeight ? "#ef4444" : theme.textPrimary }}>
                {totalWeight.toFixed(1)} kg / {trip.weight} kg
              </div>
            </div>
            {isOverWeight && <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "600" }}>Over capacity!</span>}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{ ...btn("ghost"), flex: 1 }} onClick={onDecline}>Decline all</button>
            <button 
              style={{ ...btn("primary"), flex: 2, opacity: (selected.length > 0 && !isOverWeight) ? 1 : 0.4 }} 
              disabled={selected.length === 0 || isOverWeight}
              onClick={() => onAccept(selected)}
            >
              Accept {selected.length} item{selected.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Stage 4: Handover Brief ────────────────────────────────────

function HandoverView({ trip, handover, onConfirm, onViewTrips }) {
  const h = handover || {};
  const items = h.items || (trip.matchData ? (Array.isArray(trip.matchData) ? trip.matchData : [trip.matchData]) : []);
  const totalWeight = h.totalWeight ?? items.reduce((s, i) => s + (i.weight || 0), 0);

  return (
    <div style={{ maxWidth: "580px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>Handover brief</div>
        <div style={{ fontSize: "13px", color: theme.textSecondary }}>Your match is confirmed — here's everything you need for the handover</div>
      </div>

      {/* Volunteer */}
      <Card style={{ marginBottom: "14px" }}>
        <CardHeader title="Volunteer contact" />
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "20px" }}>👤</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: theme.textPrimary, marginBottom: "3px" }}>
              {h.volunteer || <span style={{ color: theme.textTertiary, fontStyle: "italic" }}>Volunteer will be assigned soon</span>}
            </div>
            <div style={{ fontSize: "13px", color: theme.textSecondary }}>
              {h.volunteerPhone || ""}
            </div>
          </div>
        </div>
      </Card>

      {/* Items */}
      <Card style={{ marginBottom: "14px" }}>
        <CardHeader title="Items to carry" right={<Badge color={theme.accent} bg={theme.accentDim}>{totalWeight} kg total</Badge>} />
        <div style={{ padding: "0 20px" }}>
          {items.length > 0 ? items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < items.length - 1 ? `1px solid ${theme.border}` : "none" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary, marginBottom: "2px" }}>{item.name}</div>
                <div style={{ fontSize: "11px", color: theme.textSecondary }}>{item.description} &middot; for {item.requester}</div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: theme.textSecondary }}>{item.weight} kg</div>
            </div>
          )) : (
            <div style={{ padding: "16px 0", fontSize: "13px", color: theme.textTertiary, fontStyle: "italic" }}>
              No items assigned yet.
            </div>
          )}
        </div>
      </Card>

      {/* Meet-up details */}
      <Card style={{ marginBottom: "20px" }}>
        <CardHeader title="Meet-up details" />
        <div style={{ padding: "20px" }}>
          <div style={{ background: theme.accentDim, border: `1px solid ${theme.accent}40`, borderRadius: "10px", padding: "16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", color: theme.accentLight, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600", marginBottom: "4px" }}>When</div>
              <div style={{ fontSize: "20px", fontWeight: "600", color: theme.textPrimary, letterSpacing: "-0.5px" }}>{h.date || trip.date} &middot; {h.time || "—"}</div>
            </div>
            <Badge color={theme.amber} bg={theme.amberDim}>Upcoming</Badge>
          </div>
          {[
            { label: "Location", value: h.location || "To be confirmed", icon: "&#128205;" },
            { label: "Landmark", value: h.landmark || "—", icon: "&#127991;" },
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
        Tap confirm after you've received all items from {h.volunteer || "the volunteer"} before boarding
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: theme.surface, borderRadius: "10px", border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: "18px" }}>👤</div>
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
  const [checked, setChecked] = useState(Object.fromEntries((arrival.items || []).map((_, i) => [i, false])));
  const [proof, setProof] = useState(null);
  const allChecked = Object.values(checked).every(Boolean);

  function handleProofSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProof({
      name: file.name,
      url: URL.createObjectURL(file),
    });
  }

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>Arrival handover</div>
        <div style={{ fontSize: "13px", color: theme.textSecondary }}>Hand over the items to the local volunteer to complete the request</div>
      </div>

      {/* Local volunteer */}
      <Card style={{ marginBottom: "14px" }}>
        <CardHeader title="Local volunteer" />
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "20px" }}>👤</div>
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
          {(arrival.items || []).map((item, i) => (
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

      <Card style={{ marginBottom: "20px" }}>
        <CardHeader title="Confirmation image" />
        <div style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "13px", color: theme.textSecondary, lineHeight: "1.6", marginBottom: "12px" }}>
            Attach an optional image of the final handover for the receiving contact.
          </div>
          <label style={{ ...btn("ghost"), display: "inline-flex", alignItems: "center" }}>
            Attach image
            <input type="file" accept="image/*" onChange={handleProofSelect} style={{ display: "none" }} />
          </label>
          {proof && (
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <img src={proof.url} alt="Delivery proof" style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${theme.border}` }} />
              <div style={{ fontSize: "12px", color: theme.textSecondary }}>{proof.name}</div>
            </div>
          )}
        </div>
      </Card>

      <button
        style={{ ...btn("primary"), width: "100%", padding: "12px", fontSize: "14px", opacity: allChecked ? 1 : 0.4 }}
        disabled={!allChecked}
        onClick={() => onConfirm(proof)}
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
  [STAGES.HANDOVER]:      "Handover",
  [STAGES.DEPARTED]:      "En route",
  [STAGES.ARRIVAL]:       "Arrival",
  [STAGES.COMPLETED]:     "Completed",
  [STAGES.NO_VOLUNTEER]:  "No Items Need Transport",
  [STAGES.DECLINED]:      "Declined",
  [STAGES.UNAVAILABLE]:   "No Items Found",
};

export default function MyTrip() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { assignments, completeAssignment } = useVolunteers();
  const { updateRequestStatus } = useRequests();
  const { trips, activeTripId, setActiveTripId, addTrip, confirmMatches,
          stage, setStage, tripData, activeHandover, resetTrip, completeTrip, updateTrip, completedTrips, updateTripStatus } = useTrip();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Show register form when no trips yet, or user clicked + New trip
  const displayRegister = trips.length === 0 || showRegister;

  function handleReset() {
    resetTrip();
  }

  const linkedAssignment = getTripLinkedAssignment(tripData, assignments);
  const travellerStats = [...completedTrips, ...staticHistory].filter((trip) => trip.travellerName === userName)
    .reduce((accumulator, trip) => ({ totalTrips: accumulator.totalTrips + 1, totalKg: accumulator.totalKg + Number(trip.kg ?? 0) }), { totalTrips: 0, totalKg: 0 });
  const travellerLevel = getTravellerLevelProgress(travellerStats.totalKg);
  const displayHandover = linkedAssignment ? {
    ...activeHandover,
    time: linkedAssignment.time,
    location: linkedAssignment.location,
    volunteer: linkedAssignment.volunteerName,
    volunteerPhone: linkedAssignment.volunteerPhone,
    totalWeight: linkedAssignment.weightKg,
    items: [{
      name: linkedAssignment.item,
      description: `For ${linkedAssignment.requesterName}`,
      weight: linkedAssignment.weightKg,
      requester: linkedAssignment.requesterName,
    }],
  } : activeHandover;
  
  const displayArrival = tripData?.arrivalData ? {
    ...DEMO_ARRIVAL,
    ...tripData.arrivalData,
    items: tripData.matchData || [],
    totalWeight: (tripData.matchData || []).reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
  } : DEMO_ARRIVAL;

  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, color: theme.textPrimary,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", fontSize: "14px", lineHeight: "1.5",
    }}>
      {showConfirm && (
        <ConfirmModal
          items={displayHandover.items}
          onClose={() => { setShowConfirm(false); }}
          onConfirm={(proof) => {
            if (tripData) updateTrip(tripData.id, { pickupProof: proof });
            if (linkedAssignment) {
              completeAssignment(linkedAssignment.id);
              if (linkedAssignment.requestId) updateRequestStatus(linkedAssignment.requestId, "inTransit");
            }
            setShowConfirm(false);
            setStage(STAGES.DEPARTED);
          }}
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
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>Register a trip</div>
              <div style={{ fontSize: "13px", color: theme.textSecondary }}>Tell us about your journey and how much spare baggage you have</div>
            </div>
            <RegisterTripForm onSubmit={form => { addTrip({ ...form, travellerName: userName }); setShowRegister(false); }} />
          </div>
        )}
        {!displayRegister && stage === STAGES.NO_VOLUNTEER && (
          <NoVolunteerView onReset={handleReset} />
        )}
        {!displayRegister && stage === STAGES.AWAITING && (
          <AwaitingView 
            trip={tripData} 
            onMatchFound={() => {
              if (tripData?.candidateMatches && tripData.candidateMatches.length > 0) {
                setStage(STAGES.MATCH);
              } else {
                updateTripStatus(tripData.id, "unavailable");
                // Use a custom state if we want better feedback, for now just updating the label in STAGE_LABEL
                setStage(STAGES.NO_VOLUNTEER);
              }
            }} 
          />
        )}
        {!displayRegister && stage === STAGES.MATCH && (
          <MatchView
            trip={tripData}
            candidateMatches={tripData.candidateMatches || []}
            onAccept={(indices) => confirmMatches(indices)}
            onDecline={() => { updateTripStatus(tripData.id, "declined"); setStage(STAGES.NO_VOLUNTEER); }}
          />
        )}
        {!displayRegister && stage === STAGES.HANDOVER && (
          <HandoverView
            trip={tripData}
            handover={displayHandover}
            onConfirm={() => setShowConfirm(true)}
            onViewTrips={() => navigate("/history")}
          />
        )}
        {!displayRegister && stage === STAGES.DEPARTED && (
          <DepartedView
            trip={tripData}
            handover={displayHandover}
            arrival={displayArrival}
            onLanded={() => setStage(STAGES.ARRIVAL)}
          />
        )}
        {!displayRegister && stage === STAGES.ARRIVAL && (
          <ArrivalView
            trip={tripData}
            arrival={displayArrival}
            onConfirm={(proof) => {
              if (tripData) updateTrip(tripData.id, { deliveryProof: proof });
              completeTrip(tripData?.id, { deliveryProof: proof });
              setStage(STAGES.COMPLETED);
            }}
          />
        )}
        {!displayRegister && stage === STAGES.COMPLETED && (
          <CompletedView trip={tripData} handover={displayHandover} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
