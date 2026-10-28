import { Tile, TileLabel, TileValue } from "./StatsScreen.styles";
import type { StatTileProps } from "./StatsScreen.types";

export function StatTile({ value, label, big = false, children }: StatTileProps) {
  return (
    <Tile $big={big}>
      <TileValue $big={big}>{value}</TileValue>
      <TileLabel>{label}</TileLabel>
      {children}
    </Tile>
  );
}
