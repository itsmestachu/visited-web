export const theme = {
  colors: {
    frame: "#e0533d",
    card: "#f7eedb",
    paper: "#fdf8ec",
    ocean: "#e9dcbd",
    land: "#fbf4e2",
    landHover: "#f1e3bf",
    border: "#c6ab82",
    ink: "#3a2418",
    inkSoft: "#7d6150",
    line: "#e5d6b4",
    red: "#d9392a",
    redDark: "#b02a1e",
    mustard: "#f1c23f",
    wish: "#4d7194",
    wishFill: "rgba(77, 113, 148, 0.22)",
    overlay: "rgba(36, 22, 14, 0.94)",
  },
  fonts: {
    body: "'Outfit', system-ui, sans-serif",
    serif: "'DM Serif Display', Georgia, serif",
    hand: "'Caveat', 'Segoe Print', cursive",
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "18px",
  },
  shadow: {
    card: "0 1px 0 rgba(58, 36, 24, 0.08), 0 8px 24px rgba(58, 36, 24, 0.12)",
    flat: "0 2px 0 rgba(58, 36, 24, 0.14)",
  },
  layout: {
    sidebar: "380px",
    mobile: "760px",
  },
};

export type Theme = typeof theme;

export const mobile = `@media (max-width: ${theme.layout.mobile})`;

export const touch = "@media (hover: none)";
