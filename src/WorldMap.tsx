import { memo, useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from "d3-zoom";
import "d3-transition";
import type { Feature, Geometry, Polygon } from "geojson";
import { shapes, countryName } from "./countries";
import type { CountryEntry, Place, Status } from "./store";
import type { Region } from "./regions";

const WIDTH = 960;
const HEIGHT = 500;
const MAX_ZOOM = 60;

const projection = geoNaturalEarth1().fitExtent(
  [
    [8, 8],
    [WIDTH - 8, HEIGHT - 8],
  ],
  { type: "Sphere" },
);
const path = geoPath(projection);
const spherePath = path({ type: "Sphere" }) ?? "";

const mainPolygon = (f: Feature<Geometry>): Feature<Polygon> | null => {
  const g = f.geometry;
  const polygons: Polygon[] =
    g.type === "Polygon"
      ? [g]
      : g.type === "MultiPolygon"
        ? g.coordinates.map((coordinates) => ({ type: "Polygon", coordinates }))
        : [];
  let best: Feature<Polygon> | null = null;
  let bestArea = -1;
  for (const geometry of polygons) {
    const candidate: Feature<Polygon> = { type: "Feature", properties: {}, geometry };
    const area = path.area(candidate);
    if (area > bestArea) {
      bestArea = area;
      best = candidate;
    }
  }
  return best;
};

const countryPaths = shapes.map((s) => ({
  key: s.key,
  code: s.code,
  d: path(s.feature) ?? "",
  main: mainPolygon(s.feature),
}));

export type Focus =
  | { kind: "country"; code: string; nonce: number }
  | { kind: "point"; lng: number; lat: number; nonce: number };

type Hover = { label: string; badge?: string; x: number; y: number };

type Props = {
  countries: Record<string, CountryEntry>;
  places: Place[];
  regionShapes: Map<string, Region[]>;
  mode: Status;
  activePlaceId: string | null;
  focus: Focus | null;
  onCountryClick: (code: string) => void;
  onPlaceClick: (id: string) => void;
};

const STATUS_LABEL: Record<Status, string> = { visited: "odwiedzony", wish: "chcę odwiedzić" };

type LayerProps = {
  countries: Record<string, CountryEntry>;
  onClick: (code: string) => void;
  onHover: (h: Hover | null) => void;
};

const CountryLayer = memo(function CountryLayer({ countries, onClick, onHover }: LayerProps) {
  return (
    <>
      {countryPaths.map((p) => {
        if (!p.code) return <path key={p.key} d={p.d} className="country inert" />;
        const code = p.code;
        const entry = countries[code];
        const partial = entry?.status === "visited" && (entry.regions?.length ?? 0) > 0;
        const className = entry ? `country ${entry.status}` : "country";
        return (
          <path
            key={p.key}
            d={p.d}
            className={className}
            style={entry?.status === "visited" ? { fill: entry.color, fillOpacity: partial ? 0.4 : 1 } : undefined}
            onClick={() => onClick(code)}
            onPointerMove={(e) =>
              onHover({
                label: countryName(code),
                badge: entry ? STATUS_LABEL[entry.status] : undefined,
                x: e.clientX,
                y: e.clientY,
              })
            }
          />
        );
      })}
    </>
  );
});

export function WorldMap({
  countries,
  places,
  regionShapes,
  mode,
  activePlaceId,
  focus,
  onCountryClick,
  onPlaceClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const dragged = useRef(false);
  const clickRef = useRef(onCountryClick);
  const [hover, setHover] = useState<Hover | null>(null);

  useEffect(() => {
    clickRef.current = onCountryClick;
  }, [onCountryClick]);

  const handleCountryClick = useMemo(
    () => (code: string) => {
      if (!dragged.current) clickRef.current(code);
    },
    [],
  );

  const regionPaths = useMemo(() => {
    const out: { key: string; d: string; color: string }[] = [];
    for (const [code, regions] of regionShapes) {
      const entry = countries[code];
      if (!entry || entry.status !== "visited" || !entry.regions?.length) continue;
      const selected = new Set(entry.regions);
      for (const r of regions) {
        if (selected.has(r.id)) out.push({ key: `${code}-${r.id}`, d: path(r.feature) ?? "", color: entry.color });
      }
    }
    return out;
  }, [regionShapes, countries]);

  const pins = useMemo(
    () =>
      places
        .map((p) => {
          const xy = projection([p.lng, p.lat]);
          return xy ? { place: p, x: xy[0], y: xy[1] } : null;
        })
        .filter((p): p is { place: Place; x: number; y: number } => p !== null)
        .sort((a, b) => a.y - b.y),
    [places],
  );

  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svg || !g) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .translateExtent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .on("start", () => {
        dragged.current = false;
      })
      .on("zoom", (event) => {
        if (event.sourceEvent?.type === "mousemove" || event.sourceEvent?.type === "touchmove")
          dragged.current = true;
        g.setAttribute("transform", event.transform.toString());
        svg.style.setProperty("--k", String(event.transform.k));
      });
    zoomRef.current = behavior;
    svg.style.setProperty("--k", "1");
    select(svg).call(behavior).on("dblclick.zoom", null);
    return () => {
      select(svg).on(".zoom", null);
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    const behavior = zoomRef.current;
    if (!focus || !svg || !behavior) return;
    let cx: number;
    let cy: number;
    let scale: number;
    if (focus.kind === "country") {
      const main = countryPaths
        .filter((p) => p.code === focus.code && p.main)
        .map((p) => p.main as Feature<Polygon>)
        .sort((a, b) => path.area(b) - path.area(a))[0];
      if (!main) return;
      const [[x0, y0], [x1, y1]] = path.bounds(main);
      cx = (x0 + x1) / 2;
      cy = (y0 + y1) / 2;
      scale = Math.max(1, Math.min(MAX_ZOOM, 0.6 / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT)));
    } else {
      const xy = projection([focus.lng, focus.lat]);
      if (!xy) return;
      [cx, cy] = xy;
      scale = Math.max(zoomTransform(svg).k, 10);
    }
    const t = zoomIdentity
      .translate(WIDTH / 2, HEIGHT / 2)
      .scale(scale)
      .translate(-cx, -cy);
    select(svg).transition().duration(750).call(behavior.transform, t);
  }, [focus]);

  const zoomBy = (factor: number) => {
    const svg = svgRef.current;
    const behavior = zoomRef.current;
    if (svg && behavior) select(svg).transition().duration(300).call(behavior.scaleBy, factor);
  };

  const reset = () => {
    const svg = svgRef.current;
    const behavior = zoomRef.current;
    if (svg && behavior) select(svg).transition().duration(500).call(behavior.transform, zoomIdentity);
  };

  return (
    <div className={`map-wrap mode-${mode}`}>
      <svg
        ref={svgRef}
        className="map"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerLeave={() => setHover(null)}
      >
        <g ref={gRef}>
          <path className="sphere" d={spherePath} />
          <CountryLayer countries={countries} onClick={handleCountryClick} onHover={setHover} />
          <g className="regions-layer">
            {regionPaths.map((r) => (
              <path key={r.key} d={r.d} className="region-fill" style={{ fill: r.color }} />
            ))}
          </g>
          <g className="pins-layer">
            {pins.map(({ place, x, y }) => (
              <g
                key={place.id}
                className={`pin ${place.status}${place.id === activePlaceId ? " active" : ""}`}
                style={{ transform: `translate(${x}px, ${y}px) scale(calc(1.3 / var(--k)))` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!dragged.current) onPlaceClick(place.id);
                }}
                onPointerMove={(e) => {
                  e.stopPropagation();
                  setHover({
                    label: place.name,
                    badge: place.photos.length ? `${place.photos.length} zdj.` : countryName(place.countryCode),
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
              >
                <path
                  className="pin-body"
                  d="M0 0C-1.6-3.2-6-6.4-6-10.5a6 6 0 1 1 12 0C6-6.4 1.6-3.2 0 0Z"
                />
                <circle className="pin-dot" cx="0" cy="-10.5" r="2.4" />
              </g>
            ))}
          </g>
        </g>
      </svg>

      {hover && (
        <div className="tooltip" style={{ left: hover.x, top: hover.y }}>
          {hover.label}
          {hover.badge && <span className="tooltip-badge">{hover.badge}</span>}
        </div>
      )}

      <div className="zoom-controls">
        <button type="button" onClick={() => zoomBy(1.6)} aria-label="Przybliż">
          +
        </button>
        <button type="button" onClick={() => zoomBy(1 / 1.6)} aria-label="Oddal">
          −
        </button>
        <button type="button" onClick={reset} aria-label="Cała mapa">
          ⤢
        </button>
      </div>
    </div>
  );
}
