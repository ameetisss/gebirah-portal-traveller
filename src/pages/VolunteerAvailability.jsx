import { Card } from "../components/UIKit";
import { theme, btn } from "../theme";
import { useVolunteers } from "../context/VolunteerContext";

export default function VolunteerAvailability() {
  const { availabilityDays, toggleAvailability } = useVolunteers();

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.04em" }}>Availability</div>
        <div style={{ marginTop: "8px", fontSize: "14px", color: "#786F62" }}>
          Toggle days you can cover airport handovers. This updates the same availability snapshot shown on the volunteer dashboard.
        </div>
      </div>

      <Card>
        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "600", color: theme.textPrimary }}>May 2026</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
              <div key={day} style={{ textAlign: "center", fontSize: "11px", color: theme.textTertiary }}>{day}</div>
            ))}
            {Array.from({ length: 31 }, (_, index) => {
              const day = index + 1;
              const active = availabilityDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleAvailability(day)}
                  style={{
                    height: "42px",
                    borderRadius: "12px",
                    border: active ? "1px solid #D6E7B3" : `1px solid ${theme.border}`,
                    background: active ? "#EAF3DB" : "transparent",
                    color: active ? "#516827" : theme.textSecondary,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px", fontSize: "13px", color: theme.textSecondary }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#EAF3DB", display: "inline-block" }} />Available</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", border: `1px solid ${theme.border}`, display: "inline-block" }} />Unavailable</span>
          </div>

          <button type="button" style={{ ...btn("ghost"), marginTop: "18px" }}>
            Availability saved
          </button>
        </div>
      </Card>
    </>
  );
}
