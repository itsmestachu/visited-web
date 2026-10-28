import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CityIndex } from "../../data/cities";
import type { City } from "../../types/geo";
import type { CountryEntry, Place, Status } from "../../types/models";
import type { Focus, Hover } from "../../types/map";
import { useMapZoom } from "../../hooks/useMapZoom";
import { useElementSize } from "../../hooks/useElementSize";
import { useLabelLayout } from "../../hooks/useLabelLayout";
import { anchorFor, createViewport, HEIGHT, MAX_ZOOM, projection, spherePath, WIDTH } from "./projection";
import { CountryLayer } from "./CountryLayer";
import { LabelLayer } from "./LabelLayer";
import { PinLayer } from "./PinLayer";
import { ZoomControls } from "./ZoomControls";
import { MapTooltip } from "./MapTooltip";
import { PhotoPopover } from "./PhotoPopover";
import "./WorldMap.css";

type Props = {
  countries: Record<string, CountryEntry>;
  places: Place[];
  cities: CityIndex | null;
  mode: Status;
  activePlaceId: string | null;
  popoverPlaceId: string | null;
  focus: Focus | null;
  onCountryClick: (code: string) => void;
  onCityClick: (city: City) => void;
  onPlaceClick: (id: string) => void;
  onOpenPhotos: (placeId: string, index: number, autoplay: boolean) => void;
  onClosePopover: () => void;
};

const POINT_ZOOM = 12;

export function WorldMap({
  countries,
  places,
  cities,
  mode,
  activePlaceId,
  popoverPlaceId,
  focus,
  onCountryClick,
  onCityClick,
  onPlaceClick,
  onOpenPhotos,
  onClosePopover,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(wrapRef);
  const { svgRef, gRef, zoomState, zoomTo, zoomBy, reset, currentK, wasDragged } = useMapZoom();
  const viewport = useMemo(() => createViewport(zoomState, size), [zoomState, size]);
  const { pins, countryLabels, cityItems } = useLabelLayout(viewport, cities, places);
  const [hover, setHover] = useState<Hover | null>(null);

  const countryClickRef = useRef(onCountryClick);
  useEffect(() => {
    countryClickRef.current = onCountryClick;
  }, [onCountryClick]);

  const handleCountryClick = useCallback(
    (code: string) => {
      if (!wasDragged()) countryClickRef.current(code);
    },
    [wasDragged],
  );

  const handleCityClick = (city: City) => {
    if (!wasDragged()) onCityClick(city);
  };

  const handlePinClick = (id: string) => {
    if (!wasDragged()) onPlaceClick(id);
  };

  useEffect(() => {
    if (!focus) return;
    if (focus.kind === "country") {
      const a = anchorFor(focus.code);
      if (!a) return;
      const [[x0, y0], [x1, y1]] = a.bounds;
      const k = 0.6 / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT);
      zoomTo((x0 + x1) / 2, (y0 + y1) / 2, Math.min(MAX_ZOOM, k));
    } else {
      const p = projection([focus.lng, focus.lat]);
      if (p) zoomTo(p[0], p[1], Math.max(currentK(), POINT_ZOOM));
    }
  }, [focus, zoomTo, currentK]);

  const popoverPin = popoverPlaceId ? pins.find((p) => p.place.id === popoverPlaceId && p.place.photos.length > 0) : undefined;

  const overlayTransform = `scale(${1 / viewport.scale}) translate(${-viewport.offsetX} ${-viewport.offsetY})`;

  return (
    <div ref={wrapRef} className={`map-wrap mode-${mode}`}>
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
        </g>
        <g transform={overlayTransform} onPointerMove={() => setHover(null)}>
          <LabelLayer countryLabels={countryLabels} cityItems={cityItems} onCityClick={handleCityClick} />
          <PinLayer pins={pins} activePlaceId={activePlaceId} onPinClick={handlePinClick} />
        </g>
      </svg>

      {hover && <MapTooltip hover={hover} />}

      {popoverPin && (
        <PhotoPopover
          place={popoverPin.place}
          x={popoverPin.x}
          y={popoverPin.y - 12}
          areaWidth={size.width}
          areaHeight={size.height}
          onOpen={(index, autoplay) => onOpenPhotos(popoverPin.place.id, index, autoplay)}
          onClose={onClosePopover}
        />
      )}

      <ZoomControls onZoomIn={() => zoomBy(1.6)} onZoomOut={() => zoomBy(1 / 1.6)} onReset={reset} />
    </div>
  );
}
