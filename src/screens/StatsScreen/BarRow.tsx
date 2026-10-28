import { Bar, BarCaption, BarLabel, BarTrack } from "./StatsScreen.styles";
import type { BarRowProps } from "./StatsScreen.types";

export function BarRow({ label, value, max, caption }: BarRowProps) {
  return (
    <Bar>
      <BarLabel>{label}</BarLabel>
      <BarTrack>
        <div style={{ width: `${(value / max) * 100}%` }} />
      </BarTrack>
      <BarCaption>{caption}</BarCaption>
    </Bar>
  );
}
