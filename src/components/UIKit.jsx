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
      padding: "3px 8px",
      borderRadius: "20px",
      fontWeight: "600",
      color,
      background: bg,
      letterSpacing: "0.02em",
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
      borderRadius: "12px",
      overflow: "hidden",
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
    }}>
      <span style={{ fontSize: "13px", fontWeight: "600", color: theme.textPrimary, letterSpacing: "-0.2px" }}>{title}</span>
      {right}
    </div>
  );
}
