import { useCallback, useState } from "react";
import type { PanelView, ViewerState } from "../types/navigation";
import type { Focus } from "../types/map";
import type { SidebarTab } from "../components/layout/Sidebar";

export const useNavigation = () => {
  const [tab, setTab] = useState<SidebarTab>("map");
  const [view, setView] = useState<PanelView>({ type: "home" });
  const [focus, setFocus] = useState<Focus | null>(null);
  const [popoverPlaceId, setPopoverPlaceId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  const goHome = useCallback(() => {
    setView({ type: "home" });
    setPopoverPlaceId(null);
  }, []);

  const openCountry = useCallback((code: string) => {
    setTab("map");
    setView({ type: "country", code });
    setPopoverPlaceId(null);
  }, []);

  const openPlace = useCallback((id: string, withGallery = false) => {
    setTab("map");
    setView({ type: "place", id });
    setPopoverPlaceId(withGallery ? id : null);
  }, []);

  const focusCountry = useCallback((code: string) => setFocus({ kind: "country", code, nonce: Date.now() }), []);

  const focusPoint = useCallback(
    (lng: number, lat: number) => setFocus({ kind: "point", lng, lat, nonce: Date.now() }),
    [],
  );

  return {
    tab,
    setTab,
    view,
    focus,
    popoverPlaceId,
    closePopover: () => setPopoverPlaceId(null),
    viewer,
    openViewer: (placeId: string, index: number, autoplay: boolean) => setViewer({ placeId, index, autoplay }),
    closeViewer: () => setViewer(null),
    goHome,
    openCountry,
    openPlace,
    focusCountry,
    focusPoint,
  };
};
