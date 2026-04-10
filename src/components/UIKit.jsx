import { theme } from "../theme";

export function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: "11px",
      color: theme.textTertiary,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontWeight: "600",
      marginBottom: "5px",
    }}>{children}</div>
  );
}

export function Badge({ color, bg, children }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "11px",
      padding: "4px 9px",
      borderRadius: "999px",
      fontWeight: "600",
      color,
      background: bg,
      letterSpacing: "0.02em",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.28)",
    }}>{children}</span>
  );
}

export function StatusDot({ color }) {
  return (
    <span style={{
      display: "inline-block",
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: color,
      marginRight: "4px",
    }} />
  );
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 10px 32px rgba(46, 35, 19, 0.04)",
      transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
      animation: "card-fade-in 320ms ease both",
      ...style,
    }}>{children}</div>
  );
}

export function CardHeader({ title, right }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: `1px solid ${theme.border}`,
      background: "rgba(255,255,255,0.42)",
    }}>
      <span style={{ fontSize: "13px", fontWeight: "600", color: theme.textPrimary, letterSpacing: "-0.2px" }}>{title}</span>
      {right}
    </div>
  );
}
