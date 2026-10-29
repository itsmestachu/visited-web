import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from "d3-zoom";
import "d3-transition";
import type { CityIndex } from "../../data/cities";
import type { Landmark } from "../../data/data.types";
import type { Place, TripStop } from "../../store/store.types";
import { anchorFor, createViewport, HEIGHT, MAX_ZOOM, projection, toScreen, WIDTH } from "./WorldMap.projection";
import { applyPins, computeBaseLayout, layoutRoute } from "./WorldMap.layout";
import type { Focus, ProjectedCities, ProjectedLandmark, Size, ZoomState } from "./WorldMap.types";

const IDENTITY: ZoomState = { x: 0, y: 0, k: 1 };
const POINT_ZOOM = 12;
// Labels ride along with the map transform during a gesture, so re-running the label layout every frame is wasted work.
const LAYOUT_INTERVAL = 100;

export const useElementSize = (ref: RefObject<HTMLElement | null>) => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
};

export const useMapZoom = (onFrame: (zoom: ZoomState) => void) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const draggedRef = useRef(false);
  const frameRef = useRef(0);
  const latestRef = useRef<ZoomState>(IDENTITY);
  const [zoomState, setZoomState] = useState<ZoomState>(IDENTITY);
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

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
        draggedRef.current = false;
      })
      .on("zoom", (event) => {
        const type = event.sourceEvent?.type;
        if (type === "mousemove" || type === "touchmove" || type === "pointermove") draggedRef.current = true;
        g.setAttribute("transform", event.transform.toString());
        latestRef.current = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
        onFrameRef.current(latestRef.current);
        if (!frameRef.current) {
          frameRef.current = window.setTimeout(() => {
            frameRef.current = 0;
            setZoomState(latestRef.current);
          }, LAYOUT_INTERVAL);
        }
      })
      .on("end", () => {
        clearTimeout(frameRef.current);
        frameRef.current = 0;
        setZoomState(latestRef.current);
      });
    behaviorRef.current = behavior;
    select(svg).call(behavior).on("dblclick.zoom", null);
    return () => {
      select(svg).on(".zoom", null);
      clearTimeout(frameRef.current);
    };
  }, []);

  const zoomTo = useCallback((cx: number, cy: number, k: number) => {
    const svg = svgRef.current;
    const behavior = behaviorRef.current;
    if (!svg || !behavior) return;
    const t = zoomIdentity
      .translate(WIDTH / 2, HEIGHT / 2)
      .scale(Math.max(1, Math.min(MAX_ZOOM, k)))
      .translate(-cx, -cy);
    select(svg).transition().duration(750).call(behavior.transform, t);
  }, []);

  const zoomBy = useCallback((factor: number) => {
    const svg = svgRef.current;
    const behavior = behaviorRef.current;
    if (svg && behavior) select(svg).transition().duration(300).call(behavior.scaleBy, factor);
  }, []);

  const reset = useCallback(() => {
    const svg = svgRef.current;
    const behavior = behaviorRef.current;
    if (svg && behavior) select(svg).transition().duration(500).call(behavior.transform, zoomIdentity);
  }, []);

  const currentK = useCallback(() => (svgRef.current ? zoomTransform(svgRef.current).k : 1), []);

  const wasDragged = useCallback(() => draggedRef.current, []);

  const latest = useCallback(() => latestRef.current, []);

  return { svgRef, gRef, zoomState, latest, zoomTo, zoomBy, reset, currentK, wasDragged };
};

export const useMapFocus = (
  focus: Focus | null,
  zoomTo: (cx: number, cy: number, k: number) => void,
  currentK: () => number,
) => {
  useEffect(() => {
    if (!focus) return;
    if (focus.kind === "country") {
      const a = anchorFor(focus.code);
      if (!a) return;
      const [[x0, y0], [x1, y1]] = a.bounds;
      zoomTo((x0 + x1) / 2, (y0 + y1) / 2, 0.6 / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT));
    } else if (focus.kind === "points") {
      const projected = focus.points.flatMap((pt) => {
        const p = projection(pt);
        return p ? [p] : [];
      });
      if (projected.length === 0) return;
      const xs = projected.map((p) => p[0]);
      const ys = projected.map((p) => p[1]);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const fit = 0.6 / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT, 1e-6);
      zoomTo((x0 + x1) / 2, (y0 + y1) / 2, Math.min(fit, POINT_ZOOM));
    } else {
      const p = projection([focus.lng, focus.lat]);
      if (p) zoomTo(p[0], p[1], Math.max(currentK(), POINT_ZOOM));
    }
  }, [focus, zoomTo, currentK]);
};

export const useLabelLayout = (
  zoomState: ZoomState,
  size: Size,
  cities: CityIndex | null,
  places: Place[],
  minCityPopulation: number,
  route: TripStop[] | null,
  landmarks: Landmark[] | null = null,
) => {
  const viewport = useMemo(() => createViewport(zoomState, size), [zoomState, size]);

  const projected = useMemo<ProjectedCities | null>(() => {
    if (!cities) return null;
    const xs = new Float32Array(cities.list.length);
    const ys = new Float32Array(cities.list.length);
    cities.list.forEach((c, i) => {
      const p = projection([c.lng, c.lat]);
      xs[i] = p ? p[0] : NaN;
      ys[i] = p ? p[1] : NaN;
    });
    return { xs, ys };
  }, [cities]);

  const placePoints = useMemo(
    () =>
      places.map((place) => {
        const p = projection([place.lng, place.lat]);
        return { place, x: p ? p[0] : NaN, y: p ? p[1] : NaN };
      }),
    [places],
  );

  const projectedLandmarks = useMemo<ProjectedLandmark[] | null>(
    () =>
      landmarks?.flatMap((landmark) => {
        const p = projection([landmark.lng, landmark.lat]);
        return p ? [{ landmark, ux: p[0], uy: p[1] }] : [];
      }) ?? null,
    [landmarks],
  );

  const base = useMemo(
    () => computeBaseLayout(viewport, cities, projected, minCityPopulation, projectedLandmarks),
    [viewport, cities, projected, minCityPopulation, projectedLandmarks],
  );

  const routeLayout = useMemo(() => (route ? layoutRoute(viewport, route) : null), [viewport, route]);

  const layout = useMemo(() => applyPins(viewport, base, placePoints, routeLayout?.boxes), [viewport, base, placePoints, routeLayout]);

  return { viewport, routeItems: routeLayout?.items ?? null, ...layout };
};

export const useLatestCallback = <A extends unknown[]>(fn: (...args: A) => void) => {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: A) => ref.current(...args), []);
};

export const useSyncedOverlay = (
  svgRef: RefObject<SVGSVGElement | null>,
  anchorRef: RefObject<HTMLDivElement | null>,
  size: Size,
  rendered: ZoomState,
  latest: () => ZoomState,
  anchorUx: number | undefined,
  anchorUy: number | undefined,
) => {
  const sync = useCallback(
    (zoom: ZoomState) => {
      const svg = svgRef.current;
      if (!svg || size.width === 0) return;
      const now = createViewport(zoom, size);
      svg.style.setProperty("--inv", String(1 / (zoom.k * now.scale)));
      const anchor = anchorRef.current;
      if (anchor && anchorUx !== undefined && anchorUy !== undefined) {
        const [x1, y1] = toScreen(now, anchorUx, anchorUy);
        const [x0, y0] = toScreen(createViewport(rendered, size), anchorUx, anchorUy);
        anchor.style.transform = `translate(${x1 - x0}px, ${y1 - y0}px)`;
      }
    },
    [svgRef, anchorRef, size, rendered, anchorUx, anchorUy],
  );

  useLayoutEffect(() => {
    sync(latest());
  }, [sync, latest]);

  return sync;
};
