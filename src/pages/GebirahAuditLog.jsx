import { useState, useEffect } from "react";
import { theme, container, btn } from "../theme";
import { Card, Badge, LoadingState } from "../components/UIKit";

export default function GebirahAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/activity-logs")
      .then(res => res.json())
      .then(result => {
        if (result.status === "success") {
          setLogs(result.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch logs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>System Audit Log</h1>
          <p style={{ color: theme.textSecondary }}>Track all coordinator actions and system overrides</p>
        </div>
        <button onClick={() => window.location.reload()} style={btn("secondary")}>Refresh Log</button>
      </div>

      <Card>
        <div style={{ padding: "0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#F9F8F6", borderBottom: `1px solid ${theme.border}` }}>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: theme.textSecondary, textTransform: "uppercase" }}>Timestamp</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: theme.textSecondary, textTransform: "uppercase" }}>Actor</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: theme.textSecondary, textTransform: "uppercase" }}>Action</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: theme.textSecondary, textTransform: "uppercase" }}>Entity</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: theme.textSecondary, textTransform: "uppercase" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "48px", textAlign: "center", color: theme.textSecondary }}>No logs found.</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: "16px 24px", fontSize: "14px", color: theme.textSecondary }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: "500" }}>{log.actor_name}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <Badge bg="#F0F1F3" color="#3B424E">{log.action}</Badge>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "14px" }}>
                    {log.entity_type} <span style={{ color: theme.textSecondary, fontSize: "12px" }}>({log.entity_id})</span>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", color: theme.textSecondary }}>
                    {log.metadata ? JSON.stringify(log.metadata) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
