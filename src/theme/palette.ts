export const PALETTE = [
  "#f1c23f",
  "#3f8f86",
  "#d9822b",
  "#5b7ea4",
  "#8a9a3b",
  "#8c4f6e",
  "#c8963e",
  "#2f6b7a",
  "#b0748a",
  "#93a97f",
  "#a87b51",
  "#6c5b9e",
];

export const randomColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
