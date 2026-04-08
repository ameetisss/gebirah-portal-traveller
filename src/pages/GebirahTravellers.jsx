import { Card, Badge } from "../components/UIKit";
import { theme } from "../theme";
import { useTrip } from "../context/TripContext";
import { getTravellerRows, travellerStageStyles } from "../data/gebirahData";

export default function GebirahTravellers() {
  const { trips } = useTrip();
  const travellers = getTravellerRows(trips);

  return (
    <>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600", letterSpacing: "-0.05em" }}>Travellers</h1>
        <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#786F62" }}>
          Registered trips from the traveller portal, with live baggage availability and stage visibility.
        </p>
      </div>

      <div className="gebirah-travellers-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
        {travellers.length === 0 && (
          <Card>
            <div style={{ padding: "24px", fontSize: "14px", color: theme.textSecondary }}>No traveller trips have been registered yet.</div>
          </Card>
        )}
        {travellers.map((traveller) => {
          const stageStyle = travellerStageStyles[traveller.stage];
          return (
            <Card key={traveller.id}>
              <div style={{ padding: "22px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "18px" }}>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: "600", letterSpacing: "-0.04em" }}>{traveller.name}</div>
                    <div style={{ marginTop: "6px", fontSize: "14px", color: theme.textSecondary }}>{traveller.destination}</div>
                  </div>
                  <Badge color={stageStyle.color} bg={stageStyle.bg}>{stageStyle.label}</Badge>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "4px" }}>Flight</div>
                    <div style={{ fontSize: "15px", fontWeight: "600" }}>{traveller.flight}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "4px" }}>Departure</div>
                    <div style={{ fontSize: "15px", fontWeight: "600" }}>{traveller.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "4px" }}>Free capacity</div>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: "#4D78C8" }}>{traveller.freeKg}kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", marginBottom: "4px" }}>Reserved weight</div>
                    <div style={{ fontSize: "15px", fontWeight: "600" }}>{traveller.reservedKg}kg</div>
                  </div>
                </div>

                <div style={{ height: "4px", background: theme.border, borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(((traveller.reservedKg / Math.max(traveller.freeKg + traveller.reservedKg, 0.1)) * 100), 100)}%`,
                      height: "100%",
                      background: theme.accent,
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 840px) {
          .gebirah-travellers-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
