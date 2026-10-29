import { useEffect, useRef, useState } from "react";
import type { City, UnescoSite } from "../../data/data.types";
import { ZoomControls } from "../ZoomControls/ZoomControls";
import { MapTooltip } from "../MapTooltip/MapTooltip";
import { HEIGHT, spherePath, WIDTH } from "./WorldMap.projection";
import {
  useElementSize,
  useLabelLayout,
  useLatestCallback,
  useMapFocus,
  useMapZoom,
  useSyncedOverlay,
} from "./WorldMap.hooks";
import { CountryLayer } from "./CountryLayer";
import { LabelLayer } from "./LabelLayer";
import { PinLayer } from "./PinLayer";
import { SiteLayer } from "./SiteLayer";
import { RouteLayer } from "./RouteLayer";
import { CardAnchor, MapWrap, Sphere, Svg } from "./WorldMap.styles";
import type { Hover, WorldMapProps, ZoomState } from "./WorldMap.types";

export function WorldMap({
  countries,
  places,
  cities,
  minCityPopulation,
  mode,
  activePlaceId,
  cardPlaceId,
  focus,
  onCountryClick,
  onCityClick,
  onPlaceClick,
  sites,
  collectedSites,
  onSiteClick,
  route,
  renderPinCard,
  overlay,
}: WorldMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<(zoom: ZoomState) => void>(() => undefined);
  const size = useElementSize(wrapRef);
  const { svgRef, gRef, zoomState, latest, zoomTo, zoomBy, reset, currentK, wasDragged } = useMapZoom((z) => syncRef.current(z));
  const { viewport, pins, countryLabels, cityItems, routeItems } = useLabelLayout(
    zoomState,
    size,
    cities,
    places,
    minCityPopulation,
    route,
  );
  const [hover, setHover] = useState<Hover | null>(null);
  useMapFocus(focus, zoomTo, currentK);

  const cardPin = cardPlaceId ? pins.find((p) => p.place.id === cardPlaceId) : undefined;
  const sync = useSyncedOverlay(svgRef, anchorRef, size, zoomState, latest, cardPin?.ux, cardPin?.uy);

  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  const handleCountryClick = useLatestCallback((code: string) => {
    if (!wasDragged()) onCountryClick(code);
  });

  const handleCityClick = useLatestCallback((city: City) => {
    if (!wasDragged()) onCityClick(city);
  });

  const handlePinClick = useLatestCallback((id: string) => {
    if (!wasDragged()) onPlaceClick(id);
  });

  const handleSiteClick = useLatestCallback((site: UnescoSite) => {
    if (!wasDragged()) onSiteClick(site);
  });

  return (
    <MapWrap ref={wrapRef} $mode={mode}>
      <Svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerLeave={() => setHover(null)}
      >
        <g ref={gRef}>
          <Sphere d={spherePath} />
          <CountryLayer countries={countries} onClick={handleCountryClick} onHover={setHover} />
          {sites && (
            <SiteLayer sites={sites} collected={collectedSites} viewport={viewport} onClick={handleSiteClick} onHover={setHover} />
          )}
          <g onPointerMove={() => setHover(null)}>
            <LabelLayer countryLabels={countryLabels} cityItems={cityItems} onCityClick={handleCityClick} />
            <PinLayer pins={pins} activePlaceId={activePlaceId} onPinClick={handlePinClick} />
          </g>
          {route && routeItems && <RouteLayer stops={route} items={routeItems} />}
        </g>
      </Svg>

      {hover && <MapTooltip hover={hover} />}
      {cardPin && <CardAnchor ref={anchorRef}>{renderPinCard(cardPin, size)}</CardAnchor>}
      <ZoomControls onZoomIn={() => zoomBy(1.6)} onZoomOut={() => zoomBy(1 / 1.6)} onReset={reset} />
      {overlay}
    </MapWrap>
  );
}
