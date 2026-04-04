import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import ConfirmModal from "../components/ConfirmModal";
import { Card, CardHeader, Badge, StatusDot, FieldLabel } from "../components/UIKit";
import { theme, btn, inputStyle } from "../theme";
import { useTrip, STAGES } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import TripDetailModal from "../components/TripDetailModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const {
    trips, activeTripId, setActiveTripId, addTrip, setStageForTrip,
    stage, setStage, tripData, matchAccepted, activeHandover,
    completedTrips, completeTrip,
  } = useTrip();

  const tripRegistered = trips.length > 0;

  const [showConfirm, setShowConfirm]   = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Per-trip arrival checklist: { [tripId]: { [itemIndex]: bool } }
  const [arrivalCheckedMap, setArrivalCheckedMap] = useState({});
  const getArrivalChecked = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    const items = trip?.arrivalData?.items || [];
    return arrivalCheckedMap[tripId] ?? Object.fromEntries(items.map((_, i) => [i, false]));
  };
  const setArrivalChecked = (tripId, updater) =>
    setArrivalCheckedMap(prev => ({
      ...prev,
      [tripId]: typeof updater === "function" ? updater(getArrivalChecked(tripId)) : updater,
    }));

  // Register trip form
  const [regForm, setRegForm] = useState({ destination: "", flight: "", date: "", weight: "" });
  const setReg = (k, v) => setRegForm(f => ({ ...f, [k]: v }));
  const regValid = regForm.destination && regForm.flight && regForm.date && regForm.weight;
  function handleRegister() {
    if (!regValid) return;
    addTrip(regForm);
    setRegForm({ destination: "", flight: "", date: "", weight: "" });
  }

  const stageLabelShort = s => ({
    "upcoming":          "Awaiting match",   // DB default status
    [STAGES.AWAITING]:  "Awaiting match",
    [STAGES.MATCH]:     "Match found",
    [STAGES.HANDOVER]:  "Handover",
    [STAGES.DEPARTED]:  "En route",
    [STAGES.ARRIVAL]:   "Arrival",
    [STAGES.COMPLETED]: "Completed",
    [STAGES.NO_VOLUNTEER]: "No availability",
  }[s] ?? s);

  // ── Multi-trip aggregates ─────────────────────────────────────
  const MATCHED_STAGES   = [STAGES.HANDOVER, STAGES.DEPARTED, STAGES.ARRIVAL, STAGES.COMPLETED];
  const matchedTrips     = trips.filter(t => MATCHED_STAGES.includes(t.stage));
  const totalDeclaredKg  = +(trips.reduce((s, t) => s + parseFloat(t.weight || 0), 0)).toFixed(1);
  // matchData is an array of items — sum their weights
  const totalAllocatedKg = +(matchedTrips.reduce((s, t) => {
    if (!t.matchData) return s;
    const arr = Array.isArray(t.matchData) ? t.matchData : [t.matchData];
    return s + arr.reduce((a, item) => a + parseFloat(item.weight || 0), 0);
  }, 0)).toFixed(1);
  const totalRemainingKg = +(totalDeclaredKg - totalAllocatedKg).toFixed(1);

  // All matched items across every accepted trip (matchData is an array)
  const allMatchedItems = matchedTrips.flatMap(t => {
    if (!t.matchData) return [];
    const arr = Array.isArray(t.matchData) ? t.matchData : [t.matchData];
    return arr.map(item => ({ ...item, destination: t.destination, tripFlight: t.flight }));
  });

  // ── Active-trip derived values — use optional chaining in case handover_data is null in DB ──
  const handoverDate = activeHandover?.date     ?? "TBC";
  const handoverTime = activeHandover?.time     ?? "—";
  const handoverLoc  = activeHandover?.location ?? "T3 Departure hall, Level 2";
  const handoverMeet = activeHandover
    ? `${activeHandover.volunteer ?? "Volunteer"} \u00b7 ${activeHandover.volunteerPhone ?? ""}`
    : "Nurul A. \u00b7 +65 9123 4567";

  // ── Page subtitle ─────────────────────────────────────────────
  const destList = trips.map(t => t.destination).join(", ");
  const subtitle = !tripRegistered
    ? "Register a trip to start carrying items to those in need"
    : trips.length > 1
      ? `${trips.length} active trips \u00b7 ${matchedTrips.length} ${matchedTrips.length === 1 ? "match" : "matches"} accepted`
    : stage === STAGES.DEPARTED  ? `En route to ${tripData?.destination ?? "your destination"} \u00b7 Tap when landed`
    : stage === STAGES.ARRIVAL   ? `Arrived \u00b7 Hand over items to local volunteer`
    : stage === STAGES.COMPLETED ? `Request completed \u00b7 Items delivered`
    : matchAccepted ? `Handover on ${handoverDate} at ${handoverTime} \u00b7 ${handoverLoc}`
    : `Trip to ${tripData?.destination ?? "your destination"} registered \u00b7 Searching for a match`;

  // Combined history
  const allHistory = [...completedTrips];

  // ── Metrics ───────────────────────────────────────────────────
  const metrics = [
    {
      label: "Active trips",
      value: String(trips.length),
      sub: trips.length === 0 ? "no trip yet"
         : trips.length === 1 ? `to ${trips[0].destination}`
         : destList.length > 30 ? destList.slice(0, 28) + "\u2026" : destList,
      color: theme.accent,
    },
    {
      label: "Items matched",
      value: String(allMatchedItems.length),
      sub: allMatchedItems.length > 0 ? `${totalAllocatedKg} kg total` : "awaiting match",
      color: theme.teal,
    },
    {
      label: "Capacity free",
      value: tripRegistered ? `${totalRemainingKg}kg` : "\u2014",
      sub: tripRegistered ? `of ${totalDeclaredKg}kg declared` : "register a trip",
      color: theme.amber,
    },
    {
      label: "Trips completed",
      value: String(completedTrips.length),
      sub: "since joining",
      color: theme.green,
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, color: theme.textPrimary,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", fontSize: "14px", lineHeight: "1.5",
    }}>
      {selectedTrip && <TripDetailModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
      {showConfirm && (
        <ConfirmModal
          items={activeHandover?.items || []}
          onClose={() => { setShowConfirm(false); setStage(STAGES.DEPARTED); }}
        />
      )}

      <Topbar />

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 28px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.5px", marginBottom: "4px" }}>
            Good morning, {userName}
          </div>
          <div style={{ fontSize: "13px", color: theme.textSecondary }}>{subtitle}</div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "18px 20px" }}>
              <div style={{ fontSize: "11px", color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", fontWeight: "500" }}>{m.label}</div>
              <div style={{ fontSize: "28px", fontWeight: "600", letterSpacing: "-1px", lineHeight: "1", marginBottom: "4px", color: m.color }}>{m.value}</div>
              <div style={{ fontSize: "11px", color: theme.textTertiary, marginTop: "4px" }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>

          {/* Left col */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Current trip card */}
            <Card>
              <CardHeader
                title={`Current trip${trips.length > 1 ? ` (${trips.length})` : ""}`}
                right={!tripRegistered ? null : <Badge color={theme.accent} bg={theme.accentDim}>{trips.length} active</Badge>}
              />

              {/* Empty state */}
              {!tripRegistered && (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>&#9992;</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: theme.textPrimary, marginBottom: "4px" }}>No active trip</div>
                  <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "20px", lineHeight: "1.6" }}>
                    Register a trip to start carrying items<br />to those in need
                  </div>
                  <button style={{ ...btn("primary") }} onClick={() => navigate("/trip")}>
                    Register a trip
                  </button>
                </div>
              )}

              {/* Scrollable trip list */}
              {tripRegistered && (
                <div style={{
                  maxHeight: trips.length > 1 ? "440px" : "none",
                  overflowY: trips.length > 1 ? "auto" : "visible",
                }}>
                  {trips.map((trip, index) => {
                    const tCap      = parseFloat(trip.weight);
                    const tMatched  = MATCHED_STAGES.includes(trip.stage);
                    // matchData is an array of items — sum their weights
                    const tMatchArr = Array.isArray(trip.matchData) ? trip.matchData : (trip.matchData ? [trip.matchData] : []);
                    const tAlloc    = tMatched && tMatchArr.length > 0 ? tMatchArr.reduce((a, item) => a + parseFloat(item.weight || 0), 0) : 0;
                    const tPct      = tCap > 0 ? (tAlloc / tCap) * 100 : 0;
                    const tHandover = trip.handoverData ? { ...trip.handoverData, date: trip.date } : {};
                    const tChecked  = getArrivalChecked(trip.id);
                    const tAllChecked = Object.keys(tChecked).length > 0 && Object.values(tChecked).every(Boolean);
                    const isLast    = index === trips.length - 1;

                    return (
                      <div key={trip.id} style={{
                        borderBottom: !isLast ? `1px solid ${theme.border}` : "none",
                        padding: "16px",
                      }}>
                        {/* Trip header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div>
                            <div style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.4px", marginBottom: "2px" }}>
                              Singapore &#8594; {trip.destination}
                            </div>
                            <div style={{ fontSize: "12px", color: theme.textSecondary }}>{trip.flight} &middot; {trip.date}</div>
                          </div>
                          <Badge
                            color={trip.stage === STAGES.MATCH ? theme.accent
                              : trip.stage === STAGES.COMPLETED ? theme.green
                              : MATCHED_STAGES.includes(trip.stage) ? theme.green
                              : theme.amber}
                            bg={trip.stage === STAGES.MATCH ? theme.accentDim
                              : trip.stage === STAGES.COMPLETED ? theme.greenDim
                              : MATCHED_STAGES.includes(trip.stage) ? theme.greenDim
                              : theme.amberDim}
                          >
                            {stageLabelShort(trip.stage)}
                          </Badge>
                        </div>

                        {/* Capacity bar */}
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "11px", color: theme.textTertiary }}>Baggage used</span>
                            <span style={{ fontSize: "11px", color: theme.textSecondary }}>{tAlloc} / {tCap} kg</span>
                          </div>
                          <div style={{ height: "4px", borderRadius: "2px", background: theme.border, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${tPct}%`, background: theme.accent, borderRadius: "2px", transition: "width 0.4s ease" }} />
                          </div>
                        </div>

                        {/* AWAITING */}
                        {trip.stage === STAGES.AWAITING && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", background: theme.accentDim, border: `1px solid ${theme.accent}40`, borderRadius: "8px" }}>
                            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: theme.accent, flexShrink: 0 }} />
                            <span style={{ fontSize: "12px", color: theme.accent, fontWeight: "500" }}>Searching for a match...</span>
                          </div>
                        )}

                        {/* MATCH */}
                        {trip.stage === STAGES.MATCH && trip.candidateMatches && (
                          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "12px" }}>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: theme.accent, marginBottom: "8px" }}>
                              {trip.candidateMatches.length} items found for your trip
                            </div>
                            <div style={{ fontSize: "11px", color: theme.textSecondary, marginBottom: "10px" }}>
                              {trip.candidateMatches.map(m => m.name).join(", ")}
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button style={{ ...btn("ghost"), flex: 1, padding: "7px", fontSize: "12px" }}
                                onClick={() => setStageForTrip(trip.id, STAGES.AWAITING)}>Decline</button>
                              <button style={{ ...btn("primary"), flex: 2, padding: "7px", fontSize: "12px" }}
                                onClick={() => navigate("/mytrip")}>Select Items</button>
                            </div>
                          </div>
                        )}

                        {/* HANDOVER */}
                        {trip.stage === STAGES.HANDOVER && (
                          <>
                            <div style={{ background: `${theme.accent}10`, border: `1px solid ${theme.accent}40`, borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" }}>
                              <div style={{ fontSize: "10px", color: theme.accentLight, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600", marginBottom: "4px" }}>Handover</div>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: theme.textPrimary, marginBottom: "2px" }}>{tHandover.date} &middot; {tHandover.time}</div>
                              <div style={{ fontSize: "11px", color: theme.textSecondary }}>{tHandover.location} &middot; {tHandover.volunteer}</div>
                            </div>
                            <button style={{ ...btn("primary"), width: "100%", padding: "8px", fontSize: "12px" }}
                              onClick={() => { setActiveTripId(trip.id); setShowConfirm(true); }}>
                              Confirm pickup
                            </button>
                          </>
                        )}

                        {/* DEPARTED */}
                        {trip.stage === STAGES.DEPARTED && (
                          <>
                            <div style={{ background: theme.accentDim, border: `1px solid ${theme.accent}40`, borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" }}>
                              <div style={{ fontSize: "11px", color: theme.accent, fontWeight: "500" }}>&#9992; En route &middot; local volunteer on arrival: {trip.arrivalData?.volunteer || "Unknown"}</div>
                            </div>
                            <button style={{ ...btn("primary"), width: "100%", padding: "8px", fontSize: "12px" }}
                              onClick={() => setStageForTrip(trip.id, STAGES.ARRIVAL)}>
                              I've landed \u2014 start arrival handover
                            </button>
                          </>
                        )}

                        {/* ARRIVAL */}
                        {trip.stage === STAGES.ARRIVAL && (
                          <>
                            <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "8px" }}>
                              Hand over to {trip.arrivalData?.volunteer || "Unknown"}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" }}>
                              {trip.arrivalData?.items?.map((item, i) => (
                                <div key={i}
                                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: tChecked[i] ? theme.greenDim : theme.surface, border: `1px solid ${tChecked[i] ? theme.green + "60" : theme.border}`, borderRadius: "7px", cursor: "pointer", transition: "all 0.15s" }}
                                  onClick={() => setArrivalChecked(trip.id, c => ({ ...c, [i]: !c[i] }))}
                                >
                                  <div style={{ width: "15px", height: "15px", borderRadius: "4px", border: `2px solid ${tChecked[i] ? theme.green : theme.borderLight}`, background: tChecked[i] ? theme.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                                    {tChecked[i] && <span style={{ color: "#fff", fontSize: "9px", fontWeight: "700" }}>&#10003;</span>}
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: "500", color: theme.textPrimary }}>{item.name}</span>
                                  <span style={{ fontSize: "11px", color: theme.textSecondary, marginLeft: "auto" }}>{item.weight} kg</span>
                                </div>
                              ))}
                            </div>
                            <button
                              style={{ ...btn("primary"), width: "100%", padding: "8px", fontSize: "12px", opacity: tAllChecked ? 1 : 0.4 }}
                              disabled={!tAllChecked}
                              onClick={() => { setActiveTripId(trip.id); completeTrip(); setStageForTrip(trip.id, STAGES.COMPLETED); }}
                            >
                              Confirm handover \u2014 request complete
                            </button>
                          </>
                        )}

                        {/* COMPLETED */}
                        {trip.stage === STAGES.COMPLETED && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: theme.greenDim, border: `1px solid ${theme.green}40`, borderRadius: "8px" }}>
                            <span>&#10003;</span>
                            <span style={{ fontSize: "12px", fontWeight: "600", color: theme.green }}>Request completed \u2014 items delivered</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Trip history */}
            <Card>
              <CardHeader title="Trip history" right={<span style={{ fontSize: "12px", color: theme.textTertiary }}>{allHistory.length} completed</span>} />
              <div style={{ padding: "0 20px" }}>
                {allHistory.map((trip, i) => (
                  <div key={trip.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: i < allHistory.length - 1 ? `1px solid ${theme.border}` : "none",
                    cursor: "pointer",
                  }} onClick={() => setSelectedTrip(trip)}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary, marginBottom: "2px" }}>{trip.route}</div>
                      <div style={{ fontSize: "11px", color: theme.textSecondary }}>{trip.date} &middot; {trip.items} items &middot; {trip.kg} kg</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {trip.status === "declined" ? (
                        <Badge color={theme.red} bg={theme.redDim}>Declined</Badge>
                      ) : (trip.status === "unavailable" || trip.status === "no_volunteer") ? (
                        <Badge color={theme.amber} bg={theme.amberDim}>No Volunteer</Badge>
                      ) : (
                        <Badge color={theme.green} bg={theme.greenDim}>Delivered</Badge>
                      )}
                      <span style={{ fontSize: "14px", color: theme.textTertiary }}>&rsaquo;</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Matched items */}
            <Card>
              <CardHeader
                title="Matched items"
                right={allMatchedItems.length > 0 ? <Badge color={theme.amber} bg={theme.amberDim}>{allMatchedItems.length} items</Badge> : null}
              />
              {allMatchedItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 20px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>&#128230;</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary, marginBottom: "4px" }}>No matched items yet</div>
                  <div style={{ fontSize: "12px", color: theme.textSecondary, lineHeight: "1.6" }}>
                    {tripRegistered
                      ? `We're finding items for ${trips.length > 1 ? "your trips" : `your trip to ${trips[0]?.destination}`}`
                      : "Register a trip to get matched with items"}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "0 20px" }}>
                  {allMatchedItems.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: i < allMatchedItems.length - 1 ? `1px solid ${theme.border}` : "none",
                    }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary, marginBottom: "2px" }}>{item.name}</div>
                        <div style={{ fontSize: "11px", color: theme.textSecondary }}>
                          {item.requester} &middot; {item.destination} &middot; {item.weight} kg
                        </div>
                      </div>
                      <Badge color={theme.amber} bg={theme.amberDim}>Pickup pending</Badge>
                    </div>
                  ))}
                  <div style={{
                    padding: "12px", background: theme.bg, borderRadius: "8px",
                    margin: "12px 0 16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    border: `1px solid ${theme.border}`,
                  }}>
                    <span style={{ fontSize: "12px", color: theme.textSecondary }}>Total remaining capacity</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: theme.teal }}>{totalRemainingKg} kg free</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Register a trip */}
            <Card>
              <CardHeader title="Register a trip" />
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Destination",    key: "destination", placeholder: "e.g. Amman, Jordan",  type: "text" },
                    { label: "Flight number",  key: "flight",      placeholder: "e.g. SQ 417",         type: "text" },
                    { label: "Departure date", key: "date",        placeholder: "DD / MM / YYYY",       type: "date" },
                  ].map(f => (
                    <div key={f.key}>
                      <FieldLabel>{f.label}</FieldLabel>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={regForm[f.key]}
                        onChange={e => setReg(f.key, e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                  <div>
                    <FieldLabel>Spare baggage (kg)</FieldLabel>
                    <input
                      type="number" placeholder="0.0" min="0" step="0.5"
                      value={regForm.weight}
                      onChange={e => setReg("weight", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    style={{ ...btn("primary"), marginTop: "4px", opacity: regValid ? 1 : 0.4 }}
                    disabled={!regValid}
                    onClick={handleRegister}
                  >
                    Register trip
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
