import { useEffect, useMemo, useRef, useState } from "react";
import type { City, Landmark, UnescoSite } from "../../data/data.types";
import { ZoomControls } from "../ZoomControls/ZoomControls";
import { MapTooltip } from "../MapTooltip/MapTooltip";
import { HEIGHT, MAX_ZOOM, projection, spherePath, WIDTH } from "./WorldMap.projection";
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
import { LandmarkLayer } from "./LandmarkLayer";
import { ClusterLayer } from "./ClusterLayer";
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
  showSites,
  collectedSites,
  onSiteClick,
  landmarks,
  showLandmarks,
  collectedLandmarks,
  onLandmarkClick,
  route,
  renderPinCard,
  overlay,
}: WorldMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<(zoom: ZoomState) => void>(() => undefined);
  const size = useElementSize(wrapRef);
  const { svgRef, gRef, zoomState, latest, zoomTo, zoomBy, reset, currentK, wasDragged } = useMapZoom((z) => syncRef.current(z));
  // Marked sites and landmarks always show; the layer toggles only add the unmarked ones.
  const markedLandmarks = useMemo(() => landmarks?.filter((l) => collectedLandmarks[l.id]) ?? [], [landmarks, collectedLandmarks]);
  const optionalLandmarks = useMemo(
    () => (showLandmarks && landmarks ? landmarks.filter((l) => !collectedLandmarks[l.id]) : null),
    [showLandmarks, landmarks, collectedLandmarks],
  );
  const markedSites = useMemo(() => sites?.filter((s) => collectedSites[s.id]) ?? [], [sites, collectedSites]);
  const { viewport, pins, clusters, clusteredSites, sitePositions, countryLabels, cityItems, landmarkItems, routeItems } = useLabelLayout(
    zoomState,
    size,
    cities,
    places,
    minCityPopulation,
    route,
    optionalLandmarks,
    markedLandmarks,
    markedSites,
  );
  const shownSites = showSites ? sites : markedSites;
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

  const handleLandmarkClick = useLatestCallback((landmark: Landmark) => {
    if (!wasDragged()) onLandmarkClick(landmark);
  });

  // Zoom far enough for the tile's places to separate.
  const handleClusterClick = useLatestCallback((points: [number, number][]) => {
    if (wasDragged()) return;
    const projected = points.flatMap((pt) => {
      const p = projection(pt);
      return p ? [p] : [];
    });
    if (projected.length === 0) return;
    const xs = projected.map((p) => p[0]);
    const ys = projected.map((p) => p[1]);
    const span = Math.max((Math.max(...xs) - Math.min(...xs)) / WIDTH, (Math.max(...ys) - Math.min(...ys)) / HEIGHT);
    const k = Math.min(MAX_ZOOM, Math.max(currentK() * 2.5, span > 0 ? 0.3 / span : MAX_ZOOM));
    zoomTo((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, k);
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
          {shownSites && (
            <SiteLayer
              sites={shownSites}
              collected={collectedSites}
              viewport={viewport}
              hidden={clusteredSites}
              positions={sitePositions}
              onClick={handleSiteClick}
              onHover={setHover}
            />
          )}
          <LandmarkLayer items={landmarkItems} collected={collectedLandmarks} onClick={handleLandmarkClick} onHover={setHover} />
          <g onPointerMove={() => setHover(null)}>
            <LabelLayer countryLabels={countryLabels} cityItems={cityItems} onCityClick={handleCityClick} />
            <PinLayer pins={pins} activePlaceId={activePlaceId} onPinClick={handlePinClick} />
          </g>
          <ClusterLayer clusters={clusters} onClick={handleClusterClick} />
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
