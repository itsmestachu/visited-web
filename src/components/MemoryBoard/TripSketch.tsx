import { memo, useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { shapes } from "../../data/countries";
import type { TripStop } from "../../store/store.types";
import { SketchCountry, SketchDot, SketchRoute, SketchSvg } from "./MemoryBoard.styles";

const W = 240;
const H = 180;
const PAD = 18;

// Placeholder for cards without photos: the trip's countries with its route, like a sketch on a postcard.
export const TripSketch = memo(function TripSketch({ stops }: { stops: TripStop[] }) {
  const drawing = useMemo(() => {
    const codes = new Set(stops.map((s) => s.countryCode));
    const countries = shapes.filter((s) => s.code && codes.has(s.code));
    if (countries.length === 0) return null;
    const points: FeatureCollection<Geometry> = {
      type: "FeatureCollection",
      features: stops.map((s) => ({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [s.lng, s.lat] } })),
    };
    // Fit to the stops when they spread out, otherwise (one city, or a city and its sights) to the whole country.
    const span = (values: number[]) => Math.max(...values) - Math.min(...values);
    const spread = Math.max(span(stops.map((s) => s.lng)), span(stops.map((s) => s.lat))) > 1.5;
    const target: FeatureCollection<Geometry> = spread
      ? points
      : { type: "FeatureCollection", features: countries.map((c) => c.feature) };
    const projection = geoMercator().fitExtent(
      [
        [PAD, PAD],
        [W - PAD, H - PAD],
      ],
      target,
    );
    const path = geoPath(projection);
    const route = stops.length > 1 ? path({ type: "LineString", coordinates: stops.map((s) => [s.lng, s.lat]) }) : null;
    return {
      countries: countries.map((c) => ({ key: c.key, d: path(c.feature) ?? "" })),
      route,
      dots: stops.flatMap((s) => {
        const p = projection([s.lng, s.lat]);
        return p ? [{ id: s.id, x: p[0], y: p[1] }] : [];
      }),
    };
  }, [stops]);

  if (!drawing) return <SketchSvg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" />;

  return (
    <SketchSvg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {drawing.countries.map((c) => (
        <SketchCountry key={c.key} d={c.d} />
      ))}
      {drawing.route && <SketchRoute d={drawing.route} />}
      {drawing.dots.map((d) => (
        <SketchDot key={d.id} cx={d.x} cy={d.y} r={3.5} />
      ))}
    </SketchSvg>
  );
});
