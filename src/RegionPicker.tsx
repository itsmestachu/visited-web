import { useMemo, useState } from "react";
import { geoAzimuthalEqualArea, geoCentroid, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { regionCount, useRegions } from "./regions";

type Props = {
  code: string;
  color: string;
  selected: string[];
  onToggle: (regionId: string) => void;
};

const W = 300;
const H = 220;

export function RegionPicker({ code, color, selected, onToggle }: Props) {
  const regions = useRegions(code);
  const [hover, setHover] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const shapes = useMemo(() => {
    if (!regions) return null;
    const fc: FeatureCollection<Geometry> = { type: "FeatureCollection", features: regions.map((r) => r.feature) };
    const [lng, lat] = geoCentroid(fc);
    const projection = geoAzimuthalEqualArea()
      .rotate([-lng, -lat])
      .fitExtent(
        [
          [4, 4],
          [W - 4, H - 4],
        ],
        fc,
      );
    const path = geoPath(projection);
    return regions.map((r) => ({ id: r.id, name: r.name, d: path(r.feature) ?? "" }));
  }, [regions]);

  const total = regionCount[code];
  const hoverName = hover ? regions?.find((r) => r.id === hover)?.name : undefined;

  return (
    <div className="field">
      <div className="field-head">
        <span className="field-label">
          Regiony · {selected.length} / {total}
        </span>
        <button type="button" className="link-button" onClick={() => setShowList((s) => !s)}>
          {showList ? "Ukryj listę" : "Lista"}
        </button>
      </div>
      <div className="region-map">
        {shapes ? (
          <svg viewBox={`0 0 ${W} ${H}`} onPointerLeave={() => setHover(null)}>
            {shapes.map((s) => (
              <path
                key={s.id}
                d={s.d}
                className={selectedSet.has(s.id) ? "region selected" : "region"}
                style={selectedSet.has(s.id) ? { fill: color } : undefined}
                onClick={() => onToggle(s.id)}
                onPointerEnter={() => setHover(s.id)}
              />
            ))}
          </svg>
        ) : (
          <div className="region-loading">Wczytywanie regionów…</div>
        )}
        <div className="region-hover">{hoverName ?? "Kliknij region, aby go zaznaczyć"}</div>
      </div>
      {showList && shapes && (
        <ul className="region-list">
          {shapes
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, "pl"))
            .map((s) => (
              <li key={s.id}>
                <label>
                  <input type="checkbox" checked={selectedSet.has(s.id)} onChange={() => onToggle(s.id)} />
                  {s.name}
                </label>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
