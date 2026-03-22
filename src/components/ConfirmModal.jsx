import { useState } from "react";
import { theme, btn } from "../theme";

export default function ConfirmModal({ items, onClose }) {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(Object.fromEntries(items.map((_, i) => [i, false])));
  const allChecked = Object.values(checked).every(Boolean);
  const totalKg = items.reduce((s, i) => s + i.weight, 0).toFixed(1);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }}>
      <div style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: "16px",
        padding: "28px",
        width: "420px",
        maxWidth: "90vw",
      }}>
        {step === 0 && (
          <>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.4px" }}>
              Confirm pickup
            </div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "20px" }}>
              Check off each item you received from the volunteer
            </div>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px",
                  background: checked[i] ? theme.greenDim : theme.surface,
                  border: `1px solid ${checked[i] ? theme.green + "60" : theme.border}`,
                  borderRadius: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
              >
                <div style={{
                  width: "18px", height: "18px", borderRadius: "5px",
                  border: `2px solid ${checked[i] ? theme.green : theme.borderLight}`,
                  background: checked[i] ? theme.green : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.15s",
                }}>
                  {checked[i] && <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: theme.textPrimary }}>{item.name}</div>
                  <div style={{ fontSize: "11px", color: theme.textSecondary }}>{item.weight} kg · {item.requester}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
              <button style={{ ...btn("ghost"), flex: 1 }} onClick={onClose}>Cancel</button>
              <button
                style={{ ...btn("primary"), flex: 2, opacity: allChecked ? 1 : 0.4 }}
                disabled={!allChecked}
                onClick={() => setStep(1)}
              >
                Confirm items received
              </button>
            </div>
          </>
        )}
        {step === 1 && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: theme.greenDim, border: `2px solid ${theme.green}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "24px",
            }}>✓</div>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px", letterSpacing: "-0.4px" }}>
              Pickup confirmed
            </div>
            <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "20px", lineHeight: "1.6" }}>
              {totalKg} kg confirmed · Gebirah notified · Volunteer assignment closed
            </div>
            <button style={{ ...btn("success"), width: "100%" }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
