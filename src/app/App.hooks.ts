import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppTab } from "../components/AppHeader/AppHeader.types";
import type { Focus } from "../components/WorldMap/WorldMap.types";
import type { UndoToastInput } from "../components/Toast/Toast.types";
import type { City, UnescoSite } from "../data/data.types";
import { countryName } from "../data/countries";
import { UNESCO } from "../data/unesco";
import { placeFromCity } from "../store/store.factories";
import type { AppData, Dispatch, Place, Status, Trip, TripStop } from "../store/store.types";
import { newTrip, stopFromPlace, stopFromSite } from "../services/trips/trips";
import type { UnescoIndex } from "../data/unesco";
import type { WishSuggestion } from "../screens/TripScreen/TripScreen.types";
import { decodeTrip, encodeTrip, SHARE_PREFIX, type SharedTrip } from "../services/trips/trips.share";
import { deletePhoto, savePhoto } from "../services/photoStorage/photoStorage";
import type { UploadProgress } from "../services/photoStorage/photoStorage.hooks";
import type { PanelView, ViewerState } from "./App.types";

export const useNavigation = () => {
  const [tab, setTab] = useState<AppTab>("map");
  const [view, setView] = useState<PanelView>({ type: "home" });
  const [focus, setFocus] = useState<Focus | null>(null);
  const [cardPlaceId, setCardPlaceId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  const goHome = useCallback(() => {
    setView({ type: "home" });
    setCardPlaceId(null);
  }, []);

  const openCountry = useCallback((code: string) => {
    setTab("map");
    setView({ type: "country", code });
    setCardPlaceId(null);
  }, []);

  const openPlace = useCallback((id: string) => {
    setTab("map");
    setView({ type: "place", id });
    setCardPlaceId(id);
  }, []);

  const focusCountry = useCallback((code: string) => setFocus({ kind: "country", code, nonce: Date.now() }), []);

  const focusPlace = useCallback((place: Place) => setFocus({ kind: "point", lng: place.lng, lat: place.lat, nonce: Date.now() }), []);

  const focusPoint = useCallback((lng: number, lat: number) => setFocus({ kind: "point", lng, lat, nonce: Date.now() }), []);

  const focusStops = useCallback((stops: TripStop[]) => {
    if (stops.length > 0) setFocus({ kind: "points", points: stops.map((s) => [s.lng, s.lat]), nonce: Date.now() });
  }, []);

  const openTrip = useCallback((id: string) => {
    setTab("profile");
    setView({ type: "trip", id });
    setCardPlaceId(null);
  }, []);

  const openSharedTrip = useCallback(() => {
    setTab("profile");
    setView({ type: "sharedTrip" });
    setCardPlaceId(null);
  }, []);

  return {
    tab,
    setTab,
    view,
    focus,
    cardPlaceId,
    closeCard: useCallback(() => setCardPlaceId(null), []),
    viewer,
    openViewer: useCallback((placeId: string, index: number, autoplay: boolean) => setViewer({ placeId, index, autoplay }), []),
    closeViewer: useCallback(() => setViewer(null), []),
    goHome,
    openCountry,
    openPlace,
    focusCountry,
    focusPlace,
    focusPoint,
    focusStops,
    openTrip,
    openSharedTrip,
  };
};

type Nav = ReturnType<typeof useNavigation>;

export const useTravelActions = (data: AppData, dispatch: Dispatch, nav: Nav, showToast: (t: UndoToastInput) => void) => {
  const removeCountry = (code: string) => {
    const entry = data.countries[code];
    if (!entry) return;
    dispatch({ type: "removeCountry", code });
    if (nav.view.type === "country" && nav.view.code === code) nav.goHome();
    showToast({
      message: `Odznaczono: ${countryName(code)}`,
      onUndo: () => dispatch({ type: "restoreCountry", code, entry }),
    });
  };

  const clickCountry = (code: string, mode: Status) => {
    const entry = data.countries[code];
    if (entry?.status === mode) {
      removeCountry(code);
      return;
    }
    dispatch({ type: "clickCountry", code, mode });
    nav.openCountry(code);
  };

  const removePlace = (id: string) => {
    const place = data.places[id];
    if (!place) return;
    dispatch({ type: "removePlace", id });
    if (nav.view.type === "place" && nav.view.id === id) nav.goHome();
    if (nav.cardPlaceId === id) nav.closeCard();
    showToast({
      message: `Usunięto: ${place.name}${place.photos.length ? ` (${place.photos.length} zdj.)` : ""}`,
      onUndo: () => dispatch({ type: "restorePlace", place }),
      onExpire: () => place.photos.forEach((p) => void deletePhoto(p)),
    });
  };

  const removePhoto = (placeId: string, photoId: string) => {
    const place = data.places[placeId];
    if (!place) return;
    const index = place.photos.indexOf(photoId);
    dispatch({ type: "removePhoto", id: placeId, photoId });
    showToast({
      message: "Usunięto zdjęcie",
      onUndo: () => dispatch({ type: "insertPhoto", id: placeId, photoId, index }),
      onExpire: () => void deletePhoto(photoId),
    });
  };

  const selectCity = (city: City, mode: Status, zoom: boolean) => {
    const existing = Object.values(data.places).find((p) => p.cityId === city.id);
    if (existing) {
      nav.openPlace(existing.id);
      if (zoom) nav.focusPlace(existing);
      return;
    }
    const previousCountry = data.countries[city.countryCode];
    const place = placeFromCity(city, mode);
    dispatch({ type: "addPlace", place });
    nav.openPlace(place.id);
    if (zoom) nav.focusPlace(place);
    showToast({
      message: `Dodano: ${place.name}`,
      onUndo: () => {
        dispatch({ type: "removePlace", id: place.id });
        if (previousCountry) dispatch({ type: "restoreCountry", code: city.countryCode, entry: previousCountry });
        else dispatch({ type: "removeCountry", code: city.countryCode });
      },
    });
  };

  const setSite = (site: UnescoSite, status: Status | null) => {
    const previous = data.collections[UNESCO]?.[site.id]?.status ?? null;
    const code = site.countryCodes.length === 1 ? site.countryCodes[0] : undefined;
    const previousCountry = code ? data.countries[code] : undefined;
    dispatch({ type: "setSite", collection: UNESCO, siteId: site.id, status, countryCode: code });
    showToast({
      message: `${status ? "Zaznaczono" : "Odznaczono"}: ${site.name}`,
      onUndo: () => {
        dispatch({ type: "setSite", collection: UNESCO, siteId: site.id, status: previous });
        if (!code) return;
        if (previousCountry) dispatch({ type: "restoreCountry", code, entry: previousCountry });
        else dispatch({ type: "removeCountry", code });
      },
    });
  };

  const clickSite = (site: UnescoSite, mode: Status) =>
    setSite(site, data.collections[UNESCO]?.[site.id]?.status === mode ? null : mode);

  return { clickCountry, removeCountry, removePlace, removePhoto, selectCity, setSite, clickSite };
};

const omitKey = <T,>(record: Record<string, T>, key: string) => {
  const next = { ...record };
  delete next[key];
  return next;
};

export const usePlaceUploads = (dispatch: Dispatch) => {
  const [progress, setProgress] = useState<Record<string, UploadProgress>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const upload = async (placeId: string, files: FileList | null) => {
    const list = files ? [...files].filter((f) => f.type.startsWith("image/")) : [];
    if (list.length === 0) return;
    setErrors((e) => omitKey(e, placeId));
    let failed = 0;
    let saved = 0;
    setProgress((p) => ({ ...p, [placeId]: { done: 0, total: list.length } }));
    for (const file of list) {
      try {
        const id = await savePhoto(file);
        dispatch({ type: "addPhotos", id: placeId, photoIds: [id] });
        saved++;
      } catch {
        failed++;
      }
      setProgress((p) => ({ ...p, [placeId]: { done: saved + failed, total: list.length } }));
    }
    setProgress((p) => omitKey(p, placeId));
    if (failed) setErrors((e) => ({ ...e, [placeId]: `Nie udało się wczytać ${failed} zdj.` }));
  };

  return {
    upload,
    progressFor: (placeId: string) => progress[placeId] ?? null,
    errorFor: (placeId: string) => errors[placeId] ?? null,
  };
};

const readSharedCode = () => (location.hash.startsWith(SHARE_PREFIX) ? location.hash.slice(SHARE_PREFIX.length) : null);

const isTouch = () => window.matchMedia("(hover: none)").matches;

export const useTrips = (data: AppData, dispatch: Dispatch, nav: Nav, showToast: (t: UndoToastInput) => void) => {
  const [shared, setShared] = useState<SharedTrip | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<{ tripId: string; text: string } | null>(null);
  const { openSharedTrip, focusStops, setTab } = nav;

  useEffect(() => {
    const load = () => {
      const code = readSharedCode();
      if (!code) return;
      history.replaceState(null, "", location.pathname + location.search);
      void decodeTrip(code).then((trip) => {
        if (trip) {
          setLinkError(null);
          setShared(trip);
          openSharedTrip();
          focusStops(trip.stops);
        } else {
          setLinkError("Ten link do planu jest uszkodzony albo niepełny. Poproś o wysłanie go jeszcze raz.");
          setTab("profile");
        }
      });
    };
    load();
    window.addEventListener("hashchange", load);
    return () => window.removeEventListener("hashchange", load);
  }, [openSharedTrip, focusStops, setTab]);

  const createTrip = () => {
    const trip = newTrip();
    dispatch({ type: "saveTrip", trip });
    nav.openTrip(trip.id);
  };

  const removeTrip = (id: string) => {
    const trip = data.trips[id];
    if (!trip) return;
    dispatch({ type: "removeTrip", id });
    nav.goHome();
    showToast({ message: `Usunięto plan: ${trip.name}`, onUndo: () => dispatch({ type: "saveTrip", trip }) });
  };

  const saveShared = () => {
    if (!shared) return;
    const trip: Trip = { ...shared, id: crypto.randomUUID(), createdAt: Date.now() };
    dispatch({ type: "saveTrip", trip });
    setShared(null);
    nav.openTrip(trip.id);
  };

  const shareTrip = async (trip: Trip) => {
    const url = await encodeTrip(trip);
    const say = (text: string) => setShareMessage({ tripId: trip.id, text });
    if (navigator.share && isTouch()) {
      try {
        await navigator.share({ title: trip.name, text: `Plan wyjazdu: ${trip.name}`, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      say("Link skopiowany. Wklej go w wiadomości do znajomych.");
    } catch {
      window.prompt("Skopiuj link do planu:", url);
    }
  };

  return {
    shared,
    linkError,
    shareMessageFor: (tripId: string) => (shareMessage?.tripId === tripId ? shareMessage.text : null),
    createTrip,
    removeTrip,
    saveShared,
    shareTrip,
    dismissShared: () => {
      setShared(null);
      nav.goHome();
    },
  };
};

// Wish-list cities and UNESCO sites offered as one-click additions to a trip.
export const useWishSuggestions = (data: AppData, unesco: UnescoIndex | null) =>
  useMemo<WishSuggestion[]>(() => {
    const places = Object.values(data.places)
      .filter((p) => p.status === "wish")
      .map((p) => ({ key: p.cityId ? `c-${p.cityId}` : `n-${p.name}`, label: p.name, toStop: (day: number) => stopFromPlace(p, day) }));
    const byId = new Map(unesco?.list.map((s) => [s.id, s]));
    const sites = Object.entries(data.collections[UNESCO] ?? {}).flatMap(([id, entry]) => {
      const site = byId.get(id);
      return entry.status === "wish" && site
        ? [{ key: `s-${id}`, label: site.name, toStop: (day: number) => stopFromSite(site, day) }]
        : [];
    });
    return [...places, ...sites];
  }, [data.places, data.collections, unesco]);

export const useAvatar = (currentId: string | undefined, dispatch: Dispatch) =>
  useCallback(
    async (file: File) => {
      const avatarId = await savePhoto(file);
      dispatch({ type: "updateProfile", patch: { avatarId } });
      if (currentId) void deletePhoto(currentId);
    },
    [currentId, dispatch],
  );
