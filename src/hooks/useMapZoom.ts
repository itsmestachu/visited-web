import { useCallback, useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from "d3-zoom";
import "d3-transition";
import type { ZoomState } from "../types/map";
import { HEIGHT, MAX_ZOOM, WIDTH } from "../components/map/projection";

const IDENTITY: ZoomState = { x: 0, y: 0, k: 1 };

export const useMapZoom = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const draggedRef = useRef(false);
  const frameRef = useRef(0);
  const latestRef = useRef<ZoomState>(IDENTITY);
  const [zoomState, setZoomState] = useState<ZoomState>(IDENTITY);

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
        if (!frameRef.current) {
          frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0;
            setZoomState(latestRef.current);
          });
        }
      });
    behaviorRef.current = behavior;
    select(svg).call(behavior).on("dblclick.zoom", null);
    return () => {
      select(svg).on(".zoom", null);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const zoomTo = useCallback((cx: number, cy: number, k: number, duration = 750) => {
    const svg = svgRef.current;
    const behavior = behaviorRef.current;
    if (!svg || !behavior) return;
    const t = zoomIdentity
      .translate(WIDTH / 2, HEIGHT / 2)
      .scale(Math.max(1, Math.min(MAX_ZOOM, k)))
      .translate(-cx, -cy);
    select(svg).transition().duration(duration).call(behavior.transform, t);
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

  return { svgRef, gRef, zoomState, zoomTo, zoomBy, reset, currentK, wasDragged };
};
