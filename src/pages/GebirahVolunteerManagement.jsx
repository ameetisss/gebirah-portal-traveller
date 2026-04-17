import { useState, useEffect } from "react";
import { theme, container, btn } from "../theme";
import { Card, Badge, LoadingState } from "../components/UIKit";

export default function GebirahVolunteerManagement() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/coordinators/volunteers")
      .then(res => res.json())
      .then(result => {
        if (result.status === "success") {
          setVolunteers(result.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch volunteers:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Volunteer Directory</h1>
          <p style={{ color: theme.textSecondary }}>Manage volunteer status, locations, and reliability</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {volunteers.map((v) => {
          const volData = v.volunteers?.[0] || {};
          const reliability = volData.reliability_score || 0;
          const statusColor = volData.is_available ? "#2E7D32" : "#E54D2E";

          return (
            <Card key={v.id}>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "50%", background: "#F0F1F3",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "600"
                  }}>
                    {v.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "18px" }}>{v.full_name}</div>
                    <div style={{ fontSize: "14px", color: theme.textSecondary }}>{v.phone || "No phone"}</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: theme.textSecondary }}>Reliability Score</span>
                    <span style={{ fontWeight: "600", color: reliability > 80 ? "#2E7D32" : "#FBC02D" }}>{reliability}%</span>
                  </div>
                  <div style={{ background: "#F0F1F3", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ background: reliability > 80 ? "#2E7D32" : "#FBC02D", width: `${reliability}%`, height: "100%" }} />
                  </div>

                  <div style={{ marginTop: "12px", borderTop: `1px solid ${theme.border}`, paddingTop: "12px", display: "flex", justifyContent: "space-between", marginTop: "auto" }}>
                    <Badge bg={volData.is_available ? "#E8F5E9" : "#FFECE3"} color={statusColor}>
                      {volData.is_available ? "Available" : "Busy"}
                    </Badge>
                    <Badge bg="#F0F1F3" color="#3B424E">
                      {volData.total_assignments || 0} Trips
                    </Badge>
                  </div>
                </div>

                <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
                  <button style={{ ...btn("secondary"), flex: 1, fontSize: "14px" }}>Message</button>
                  <button style={{ ...btn("secondary"), flex: 1, fontSize: "14px" }}>Assignment History</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
