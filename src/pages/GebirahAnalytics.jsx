import { useState, useEffect } from "react";
import { theme, container } from "../theme";
import { Card, LoadingState } from "../components/UIKit";

export default function GebirahAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/coordinators/analytics/fulfillment")
      .then(res => res.json())
      .then(result => {
        if (result.status === "success") {
          setData(result.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div style={container}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Performance Analytics</h1>
        <p style={{ color: theme.textSecondary }}>System-wide coordination and fulfillment metrics</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "32px" }}>
        <Card>
          <div style={{ padding: "24px" }}>
            <div style={{ fontSize: "14px", color: theme.textSecondary, marginBottom: "8px" }}>Fulfillment Rate</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#2E7D32" }}>{data.fulfillment_rate}%</div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "8px" }}>↑ 2.4% from last month</div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: "24px" }}>
            <div style={{ fontSize: "14px", color: theme.textSecondary, marginBottom: "8px" }}>Total Requests</div>
            <div style={{ fontSize: "32px", fontWeight: "700" }}>{data.total_requests}</div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "8px" }}>Last 30 days</div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: "24px" }}>
            <div style={{ fontSize: "14px", color: theme.textSecondary, marginBottom: "8px" }}>Fulfilled Items</div>
            <div style={{ fontSize: "32px", fontWeight: "700" }}>{data.fulfilled_requests}</div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "8px" }}>Successful handovers</div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <Card style={{ overflow: "visible" }}>
          <div style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: "18px" }}>Daily Fulfillment Trend</h3>
            <div style={{ height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
              {data?.daily_trend?.map((day, idx) => {
                const height = Math.max((day.count / 15) * 100, 2); 
                return (
                  <div key={idx} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                    <div style={{ 
                      width: "100%", 
                      height: `${height}%`, 
                      background: theme.primary, 
                      borderRadius: "4px 4px 0 0",
                      opacity: 0.8,
                      transition: "height 0.3s ease"
                    }} />
                    <div style={{ 
                      fontSize: "10px", 
                      color: theme.textSecondary, 
                      whiteSpace: "nowrap", 
                      transform: "rotate(-45deg)", 
                      marginTop: "12px",
                      marginBottom: "-20px"
                    }}>
                      {day.date.split("-")[2]} Apr
                    </div>
                  </div>
                );
              }) || <div style={{ width: "100%", textAlign: "center", color: theme.textSecondary }}>No trend data available</div>}
            </div>
            <div style={{ height: "40px" }} /> {/* Spacer for rotated labels */}
          </div>
        </Card>

        <Card>
          <div style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: "18px" }}>Efficiency metrics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
                  <span>Avg. Match Time</span>
                  <span style={{ fontWeight: "600" }}>4.2 hrs</span>
                </div>
                <div style={{ background: "#F0F1F3", height: "6px", borderRadius: "3px" }}>
                  <div style={{ background: theme.primary, width: "65%", height: "100%", borderRadius: "3px" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
                  <span>Volunteer Utilization</span>
                  <span style={{ fontWeight: "600" }}>78%</span>
                </div>
                <div style={{ background: "#F0F1F3", height: "6px", borderRadius: "3px" }}>
                  <div style={{ background: "#4D78C8", width: "78%", height: "100%", borderRadius: "3px" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
                  <span>Exception Rate</span>
                  <span style={{ fontWeight: "600" }}>3.1%</span>
                </div>
                <div style={{ background: "#F0F1F3", height: "6px", borderRadius: "3px" }}>
                  <div style={{ background: "#E54D2E", width: "15%", height: "100%", borderRadius: "3px" }} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
