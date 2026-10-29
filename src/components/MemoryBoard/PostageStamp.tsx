import stampSvg from "../../theme/icons/postal-stamp-svgrepo-com.svg?raw";
import { StampFigure, StampText } from "./MemoryBoard.styles";

// The icon is one path: the perforated outer edge first, then the inner contours of the outline and the frame.
const outline = /<path[^>]*\sd="([^"]+)"/.exec(stampSvg)?.[1].replace(/\s+/g, " ") ?? "";
const silhouette = outline.split(/(?=M)/)[0];
const SIZE = 170.024;
const WINDOW = { x: 25.94, size: 118.144 };

type Props = { value: string; label: string; tone: string; tilt: number };

export function PostageStamp({ value, label, tone, tilt }: Props) {
  return (
    <StampFigure $tilt={tilt}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <path d={silhouette} className="paper" />
        <rect x={WINDOW.x} y={WINDOW.x} width={WINDOW.size} height={WINDOW.size} fill={tone} />
        <path d={outline} className="ink" />
      </svg>
      <StampText>
        <strong>{value}</strong>
        <small>{label}</small>
      </StampText>
    </StampFigure>
  );
}
