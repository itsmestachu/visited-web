import { Fill, Track } from "./ProgressBar.styles";

type Props = { value: number; color?: string };

export function ProgressBar({ value, color }: Props) {
  return (
    <Track aria-hidden="true">
      <Fill $color={color} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </Track>
  );
}
