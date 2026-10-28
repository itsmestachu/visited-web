import { useCallback, useState } from "react";
import type { AppTab } from "../components/AppHeader/AppHeader.types";
import type { Focus } from "../components/WorldMap/WorldMap.types";
import type { UndoToastInput } from "../components/Toast/Toast.types";
import type { City, UnescoSite } from "../data/data.types";
import { countryName } from "../data/countries";
import { UNESCO } from "../data/unesco";
import { placeFromCity } from "../store/store.factories";
import type { AppData, Dispatch, Place, Status } from "../store/store.types";
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
