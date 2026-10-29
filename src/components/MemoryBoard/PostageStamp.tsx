import { useId } from "react";
import stampSvg from "../../theme/icons/postal-stamp-svgrepo-com.svg?raw";
import { StampFigure } from "./MemoryBoard.styles";

// The icon is one path: the perforated outer edge first, then the inner contours of the outline and the frame.
const outline = /<path[^>]*\sd="([^"]+)"/.exec(stampSvg)?.[1].replace(/\s+/g, " ") ?? "";
const silhouette = outline.split(/(?=M)/)[0];
const SIZE = 170.024;
const WINDOW = { x: 25.94, size: 118.144 };

type Props = { imageUrl: string | null; initial: string };

// The profile picture as a postage stamp.
export function PostageStamp({ imageUrl, initial }: Props) {
  const clipId = useId();
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
    </StampFigure>
  );
}
