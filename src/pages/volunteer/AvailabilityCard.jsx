import { useState } from "react";
import { theme, btn } from "../../theme";
import { Card, CardHeader } from "../../components/UIKit";

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = [
  { key: "morning",   label: "Morning",   time: "08–12" },
  { key: "afternoon", label: "Afternoon", time: "12–16" },
  { key: "evening",   label: "Evening",   time: "16–20" },
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function getNextDateForDay(dayStr) {
  const targetIdx = dayNames.indexOf(dayStr);
  const now = new Date();
  const currentIdx = now.getDay();
  let daysUntil = targetIdx - currentIdx;
  if (daysUntil < 0) daysUntil += 7;
  const d = new Date();
  d.setDate(now.getDate() + daysUntil);
  return `${d.getDate()}/${d.getMonth()+1}`;
}

export default function AvailabilityCard({ availability, toggleAvailability, findMatch }) {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    if (findMatch) await findMatch();
    setIsSearching(false);
  };

  return (
    <Card>
      <CardHeader
        title="My availability"
        right={<span style={{ fontSize: "12px", color: theme.textTertiary }}>Weekly schedule</span>}
      />
      <div style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "11px", color: theme.textTertiary, marginBottom: "12px", lineHeight: "1.6" }}>
          Toggle your available time windows. The coordinator will only assign runs during your available slots.
        </div>
        {/* Slot header */}
        <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 1fr", gap: "6px", marginBottom: "8px" }}>
          <div />
          {SLOTS.map(s => (
            <div key={s.key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: "600", color: theme.textSecondary }}>{s.label}</div>
              <div style={{ fontSize: "10px", color: theme.textTertiary }}>{s.time}</div>
            </div>
          ))}
        </div>
        {/* Day rows */}
        {DAYS.map(day => (
          <div key={day} style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 1fr", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "500", color: theme.textSecondary }}>{day}</div>
              <div style={{ fontSize: "10px", color: theme.textTertiary, marginTop: "2px" }}>{getNextDateForDay(day)}</div>
            </div>
            {SLOTS.map(slot => {
              const active = availability[day][slot.key];
              return (
                <button key={slot.key}
                  style={{
                    padding: "7px 0", borderRadius: "8px", fontSize: "11px", fontWeight: "600",
                    cursor: "pointer", border: `1px solid ${active ? theme.teal + "60" : theme.border}`,
                    background: active ? theme.tealDim : "transparent",
                    color: active ? theme.teal : theme.textTertiary,
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                  onClick={() => toggleAvailability(day, slot.key)}
                >
                  {active ? "✓" : "–"}
                </button>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button 
            style={{ ...btn("primary"), opacity: isSearching ? 0.7 : 1 }} 
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? "Finding matching travellers..." : "Save & Find Matches"}
          </button>
        </div>
      </div>
    </Card>
  );
}
