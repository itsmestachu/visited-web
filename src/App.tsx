import { useCallback, useMemo, useState } from "react";
import type { City, Country } from "./types/geo";
import type { Status } from "./types/models";
import { countries, countryName } from "./data/countries";
import { placeFromCity } from "./store/factories";
import { comparePl } from "./utils/text";
import { formatDate } from "./utils/dates";
import { useAppData } from "./hooks/useAppData";
import { useCities } from "./hooks/useCities";
import { useNavigation } from "./hooks/useNavigation";
import { usePlaceActions } from "./hooks/usePlaceActions";
import { WorldMap } from "./components/map/WorldMap";
import { ModeSwitch } from "./components/layout/ModeSwitch";
import { Sidebar } from "./components/layout/Sidebar";
import { PhotoViewer } from "./components/photos/PhotoViewer";
import { HomeScreen } from "./screens/home/HomeScreen";
import { CountryScreen } from "./screens/country/CountryScreen";
import { PlaceScreen } from "./screens/place/PlaceScreen";
import { StatsScreen } from "./screens/stats/StatsScreen";

export default function App() {
  const [data, dispatch] = useAppData();
  const cities = useCities();
  const nav = useNavigation();
  const { removePhoto, removePlace } = usePlaceActions(dispatch);
  const [mode, setMode] = useState<Status>("visited");

  const places = useMemo(() => Object.values(data.places).sort((a, b) => comparePl(a.name, b.name)), [data.places]);
  const visitedCount = useMemo(() => Object.values(data.countries).filter((e) => e.status === "visited").length, [data.countries]);

  const { view, openCountry, openPlace, goHome, focusCountry, focusPoint } = nav;

  const onCountryClick = useCallback(
    (code: string) => {
      const current = data.countries[code];
      dispatch({ type: "clickCountry", code, mode });
      if (current?.status === mode) {
        if (view.type === "country" && view.code === code) goHome();
      } else {
        openCountry(code);
      }
    },
    [data.countries, dispatch, mode, view, goHome, openCountry],
  );

  const selectCity = (city: City, zoom: boolean) => {
    const existing = places.find((p) => p.cityId === city.id);
    if (existing) {
      openPlace(existing.id);
    } else {
      const place = placeFromCity(city, mode);
      dispatch({ type: "addPlace", place });
      openPlace(place.id);
    }
    if (zoom) focusPoint(city.lng, city.lat);
  };

  const onPickCountry = (country: Country) => {
    dispatch({ type: "ensureCountry", code: country.code, status: mode });
    openCountry(country.code);
    focusCountry(country.code);
  };

  const activePlace = view.type === "place" ? data.places[view.id] : undefined;
  const viewerPlace = nav.viewer ? data.places[nav.viewer.placeId] : undefined;

  const renderPanel = () => {
    if (nav.tab === "stats") return <StatsScreen data={data} onOpenCountry={openCountry} />;
    if (activePlace)
      return (
        <PlaceScreen
          place={activePlace}
          dispatch={dispatch}
          onBack={goHome}
          onOpenCountry={openCountry}
          onFocus={() => focusPoint(activePlace.lng, activePlace.lat)}
          onOpenPhotos={(index, autoplay) => nav.openViewer(activePlace.id, index, autoplay)}
          onRemove={() => {
            removePlace(activePlace);
            goHome();
          }}
        />
      );
    if (view.type === "country")
      return (
        <CountryScreen
          code={view.code}
          entry={data.countries[view.code]}
          places={places.filter((p) => p.countryCode === view.code)}
          dispatch={dispatch}
          onBack={goHome}
          onOpenPlace={(id) => {
            const p = data.places[id];
            openPlace(id);
            if (p) focusPoint(p.lng, p.lat);
          }}
          onFocus={() => focusCountry(view.code)}
        />
      );
    return (
      <HomeScreen
        data={data}
        places={places}
        cities={cities}
        mode={mode}
        onPickCountry={onPickCountry}
        onPickCity={(city) => selectCity(city, true)}
        onOpenCountry={(code) => {
          openCountry(code);
          focusCountry(code);
        }}
        onOpenPlace={(id) => {
          const p = data.places[id];
          openPlace(id);
          if (p) focusPoint(p.lng, p.lat);
        }}
      />
    );
  };

  return (
    <div className="app">
      <WorldMap
        countries={data.countries}
        places={places}
        cities={cities}
        mode={mode}
        activePlaceId={activePlace?.id ?? null}
        popoverPlaceId={nav.popoverPlaceId}
        focus={nav.focus}
        onCountryClick={onCountryClick}
        onCityClick={(city) => selectCity(city, false)}
        onPlaceClick={(id) => openPlace(id, true)}
        onOpenPhotos={nav.openViewer}
        onClosePopover={nav.closePopover}
      />

      <ModeSwitch mode={mode} onChange={setMode} />

      <Sidebar tab={nav.tab} onTab={nav.setTab} visited={visitedCount} total={countries.length}>
        {renderPanel()}
      </Sidebar>

      {nav.viewer && viewerPlace && (
        <PhotoViewer
          title={viewerPlace.name}
          subtitle={[countryName(viewerPlace.countryCode), formatDate(viewerPlace.date)].filter(Boolean).join(" · ")}
          photoIds={viewerPlace.photos}
          startIndex={nav.viewer.index}
          autoplay={nav.viewer.autoplay}
          onClose={nav.closeViewer}
          onDelete={(photoId) => removePhoto(viewerPlace.id, photoId)}
        />
      )}
    </div>
  );
}
