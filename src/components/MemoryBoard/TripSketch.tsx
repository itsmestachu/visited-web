import { memo, useMemo } from "react";
import { geoBounds, geoCircle, geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { shapes } from "../../data/countries";
import type { TripStop } from "../../store/store.types";
import { SketchCountry, SketchDot, SketchHome, SketchRoute, SketchSvg } from "./MemoryBoard.styles";

const W = 240;
const H = 180;
const PAD = 18;
const AROUND_DEG = 2.8;

type Box = [[number, number], [number, number]];

let shapeBounds: Box[] | null = null;
const boundsOfShapes = () => (shapeBounds ??= shapes.map((s) => geoBounds(s.feature) as Box));

// Antimeridian-crossing boxes come back with west > east; treat those as spanning everything.
const overlaps = ([[w1, s1], [e1, n1]]: Box, [[w2, s2], [e2, n2]]: Box) =>
  s1 <= n2 && n1 >= s2 && (w1 > e1 || w2 > e2 || (w1 <= e2 && e1 >= w2));

// Placeholder for cards without photos: the area around the trip with its route, like a sketch on a postcard.
export const TripSketch = memo(function TripSketch({ stops }: { stops: TripStop[] }) {
  const drawing = useMemo(() => {
    if (stops.length === 0) return null;
    const lngs = stops.map((s) => s.lng);
    const lats = stops.map((s) => s.lat);
    const spread = Math.max(Math.max(...lngs) - Math.min(...lngs), Math.max(...lats) - Math.min(...lats)) > AROUND_DEG;
    const center: [number, number] = [lngs.reduce((a, b) => a + b, 0) / lngs.length, lats.reduce((a, b) => a + b, 0) / lats.length];
    // Spread-out trips fit their stops; a single city (or a city and its sights) shows its surroundings.
    const target: Feature<Geometry> | FeatureCollection<Geometry> = spread
      ? {
          type: "FeatureCollection",
          features: stops.map((s) => ({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [s.lng, s.lat] } })),
        }
      : { type: "Feature", properties: {}, geometry: geoCircle().center(center).radius(AROUND_DEG)() };
    const projection = geoMercator().fitExtent(
      [
        [PAD, PAD],
        [W - PAD, H - PAD],
      ],
      target,
    );
    const view = geoBounds(target) as Box;
    const all = boundsOfShapes();
    const home = new Set(stops.map((s) => s.countryCode));
    const path = geoPath(projection);
    return {
      countries: shapes.flatMap((s, i) =>
        overlaps(all[i], view) ? [{ key: s.key, d: path(s.feature) ?? "", home: Boolean(s.code && home.has(s.code)) }] : [],
      ),
      route: stops.length > 1 ? path({ type: "LineString", coordinates: stops.map((s) => [s.lng, s.lat]) }) : null,
      dots: stops.flatMap((s) => {
        const p = projection([s.lng, s.lat]);
        return p ? [{ id: s.id, x: p[0], y: p[1] }] : [];
      }),
    };
  }, [stops]);

  return (
    <SketchSvg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {drawing?.countries.map((c) => (c.home ? <SketchHome key={c.key} d={c.d} /> : <SketchCountry key={c.key} d={c.d} />))}
      {drawing?.route && <SketchRoute d={drawing.route} />}
      {drawing?.dots.map((d) => (
        <SketchDot key={d.id} cx={d.x} cy={d.y} r={3.5} />
      ))}
    </SketchSvg>
  );
});
