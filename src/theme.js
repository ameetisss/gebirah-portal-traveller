export const theme = {
  bg: "#ffffff",
  surface: "#f5f5f5",
  surfaceHover: "#ebebeb",
  border: "#e0e0e0",
  borderLight: "#cccccc",
  accent: "#7C6EF8",
  accentLight: "#9d92f9",
  accentDim: "#7C6EF820",
  teal: "#2DD4BF",
  tealDim: "#2DD4BF20",
  amber: "#F59E0B",
  amberDim: "#F59E0B20",
  green: "#22C55E",
  greenDim: "#22C55E20",
  red: "#EF4444",
  redDim: "#EF444420",
  textPrimary: "#0f0f0f",
  textSecondary: "#555555",
  textTertiary: "#888888",
};

export function btn(variant = "default") {
  return {
    padding: "9px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
    ...(variant === "primary" && { background: theme.accent, color: "#fff" }),
    ...(variant === "ghost" && {
      background: "transparent",
      color: theme.textSecondary,
      border: `1px solid ${theme.border}`,
    }),
    ...(variant === "success" && { background: theme.green, color: "#fff" }),
  };
}

export const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  border: `1px solid ${theme.border}`,
  background: theme.bg,
  color: theme.textPrimary,
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
