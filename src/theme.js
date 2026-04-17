export const theme = {
  bg: "#ffffff",
  surface: "#F8F7F4",
  surfaceHover: "#F1EFEA",
  border: "#E5E0D7",
  borderLight: "#D7D0C4",
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
  primary: "#7C6EF8",
};

export const container = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "40px 24px",
  minHeight: "100vh",
};

export function btn(variant = "default") {
  return {
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease, opacity 0.18s ease",
    ...(variant === "primary" && {
      background: theme.accent,
      color: "#fff",
      boxShadow: "0 10px 24px rgba(124, 110, 248, 0.18)",
    }),
    ...((variant === "ghost" || variant === "secondary") && {
      background: "#fff",
      color: theme.textSecondary,
      border: `1px solid ${theme.border}`,
      boxShadow: "0 4px 14px rgba(38, 31, 22, 0.04)",
    }),
    ...(variant === "success" && {
      background: theme.green,
      color: "#fff",
      boxShadow: "0 10px 24px rgba(34, 197, 94, 0.16)",
    }),
  };
}

export const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: `1px solid ${theme.border}`,
  background: theme.bg,
  color: theme.textPrimary,
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
};
