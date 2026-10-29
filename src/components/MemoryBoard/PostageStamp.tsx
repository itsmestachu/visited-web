import { useId } from "react";
import stampSvg from "../../theme/icons/postal-stamp-svgrepo-com.svg?raw";
import { Postmark, StampFigure } from "./MemoryBoard.styles";

// The icon is one path: the perforated outer edge first, then the inner contours of the outline and the frame.
const outline = /<path[^>]*\sd="([^"]+)"/.exec(stampSvg)?.[1].replace(/\s+/g, " ") ?? "";
const silhouette = outline.split(/(?=M)/)[0];
const SIZE = 170.024;
const WINDOW = { x: 25.94, size: 118.144 };

type Props = { imageUrl: string | null; initial: string; year: number };

// The profile picture as a postage stamp, cancelled with a round postmark.
export function PostageStamp({ imageUrl, initial, year }: Props) {
  const clipId = useId();
  const arcId = useId();
  return (
    <StampFigure>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect x={WINDOW.x} y={WINDOW.x} width={WINDOW.size} height={WINDOW.size} />
          </clipPath>
        </defs>
        <path d={silhouette} className="paper" />
        <rect x={WINDOW.x} y={WINDOW.x} width={WINDOW.size} height={WINDOW.size} className="window" />
        {imageUrl ? (
          <image
            href={imageUrl}
            x={WINDOW.x}
            y={WINDOW.x}
            width={WINDOW.size}
            height={WINDOW.size}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : (
          <text x={SIZE / 2} y={SIZE / 2} className="initial" textAnchor="middle" dominantBaseline="central">
            {initial}
          </text>
        )}
        <path d={outline} className="ink" />
      </svg>
      <Postmark viewBox="0 0 120 80" aria-hidden="true">
        <defs>
          <path id={arcId} d="M 22 40 a 28 28 0 1 1 56 0 a 28 28 0 1 1 -56 0" />
        </defs>
        <circle cx={50} cy={40} r={34} />
        <circle cx={50} cy={40} r={22} />
        <text fontSize={8.5}>
          <textPath href={`#${arcId}`}>MAPA PODRÓŻY ✦ POCZTA ✦</textPath>
        </text>
        <text x={50} y={43} fontSize={11} textAnchor="middle" className="year">
          {year}
        </text>
        <path d="M86 26 q6 -5 12 0 t12 0 M86 40 q6 -5 12 0 t12 0 M86 54 q6 -5 12 0 t12 0" className="waves" />
      </Postmark>
    </StampFigure>
  );
}
