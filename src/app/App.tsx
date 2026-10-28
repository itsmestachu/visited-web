import { useMemo, useState } from "react";
import type { Status } from "../store/store.types";
import { useAppData } from "../store/store.hooks";
import { useCities } from "../data/data.hooks";
import { countries, countryName } from "../data/countries";
import { comparePl } from "../utils/text";
import { formatDate } from "../utils/dates";
import { AppHeader } from "../components/AppHeader/AppHeader";
import { WorldMap } from "../components/WorldMap/WorldMap";
import { MapLegend } from "../components/MapLegend/MapLegend";
import { ModeSwitch } from "../components/ModeSwitch/ModeSwitch";
import { PlaceCard } from "../components/PlaceCard/PlaceCard";
import { PhotoViewer } from "../components/PhotoViewer/PhotoViewer";
import { Toast } from "../components/Toast/Toast";
import { useUndoToast } from "../components/Toast/Toast.hooks";
import { HomeScreen } from "../screens/HomeScreen/HomeScreen";
import { CountryScreen } from "../screens/CountryScreen/CountryScreen";
import { PlaceScreen } from "../screens/PlaceScreen/PlaceScreen";
import { StatsScreen } from "../screens/StatsScreen/StatsScreen";
import { useNavigation, usePlaceUploads, useTravelActions } from "./App.hooks";
import { Body, Card, Frame, MapArea, MapColumn, Panel } from "./App.styles";

export default function App() {
  const [data, dispatch] = useAppData();
  const cities = useCities();
  const nav = useNavigation();
  const toast = useUndoToast();
  const uploads = usePlaceUploads(dispatch);
  const actions = useTravelActions(data, dispatch, nav, toast.show);
  const [mode, setMode] = useState<Status>("visited");

  const places = useMemo(() => Object.values(data.places).sort((a, b) => comparePl(a.name, b.name)), [data.places]);
  const visitedCountries = useMemo(() => Object.values(data.countries).filter((e) => e.status === "visited").length, [data.countries]);
  const visitedCities = places.filter((p) => p.status === "visited").length;

  const activePlace = nav.view.type === "place" ? data.places[nav.view.id] : undefined;
  const viewerPlace = nav.viewer ? data.places[nav.viewer.placeId] : undefined;

  const openPlaceAndFocus = (id: string) => {
    const place = data.places[id];
    if (!place) return;
    nav.openPlace(id);
    nav.focusPlace(place);
  };

  const renderPanel = () => {
    if (nav.tab === "stats") return <StatsScreen data={data} onOpenCountry={nav.openCountry} />;
    if (activePlace)
      return (
        <PlaceScreen
          place={activePlace}
          dispatch={dispatch}
          uploading={uploads.progressFor(activePlace.id)}
          uploadError={uploads.errorFor(activePlace.id)}
          onUpload={(files) => uploads.upload(activePlace.id, files)}
          onBack={nav.goHome}
          onFocus={() => nav.focusPlace(activePlace)}
          onOpenCountry={nav.openCountry}
          onOpenPhotos={(index, autoplay) => nav.openViewer(activePlace.id, index, autoplay)}
          onDeletePhoto={(photoId) => actions.removePhoto(activePlace.id, photoId)}
          onRemove={() => actions.removePlace(activePlace.id)}
        />
      );
    if (nav.view.type === "country") {
      const code = nav.view.code;
      return (
        <CountryScreen
          code={code}
          entry={data.countries[code]}
          places={places.filter((p) => p.countryCode === code)}
          dispatch={dispatch}
          onBack={nav.goHome}
          onFocus={() => nav.focusCountry(code)}
          onOpenPlace={openPlaceAndFocus}
          onRemove={() => actions.removeCountry(code)}
          onRemovePlace={actions.removePlace}
        />
      );
    }
    return (
      <HomeScreen
        data={data}
        places={places}
        cities={cities}
        mode={mode}
        onPickCountry={(country) => {
          dispatch({ type: "ensureCountry", code: country.code, status: mode });
          nav.openCountry(country.code);
          nav.focusCountry(country.code);
        }}
        onPickCity={(city) => actions.selectCity(city, mode, true)}
        onOpenCountry={(code) => {
          nav.openCountry(code);
          nav.focusCountry(code);
        }}
        onOpenPlace={openPlaceAndFocus}
        onRemoveCountry={actions.removeCountry}
        onRemovePlace={actions.removePlace}
      />
    );
  };

  return (
    <Frame>
      <Card>
        <AppHeader tab={nav.tab} onTab={nav.setTab} visited={visitedCountries} total={countries.length} cities={visitedCities} />
        <Body>
          <Panel>{renderPanel()}</Panel>
          <MapColumn>
            <MapArea>
              <WorldMap
                countries={data.countries}
                places={places}
                cities={cities}
                mode={mode}
                activePlaceId={activePlace?.id ?? null}
                cardPlaceId={nav.cardPlaceId}
                focus={nav.focus}
                onCountryClick={(code) => actions.clickCountry(code, mode)}
                onCityClick={(city) => actions.selectCity(city, mode, false)}
                onPlaceClick={nav.openPlace}
                renderPinCard={(pin, area) => (
                  <PlaceCard
                    place={pin.place}
                    x={pin.x}
                    y={pin.y}
                    area={area}
                    uploading={uploads.progressFor(pin.place.id)}
                    onAddPhotos={(files) => uploads.upload(pin.place.id, files)}
                    onOpenPhoto={(index, autoplay) => nav.openViewer(pin.place.id, index, autoplay)}
                    onDeletePhoto={(photoId) => actions.removePhoto(pin.place.id, photoId)}
                    onDelete={() => actions.removePlace(pin.place.id)}
                    onClose={nav.closeCard}
                  />
                )}
                overlay={<ModeSwitch mode={mode} onChange={setMode} />}
              />
            </MapArea>
            <MapLegend mode={mode} />
          </MapColumn>
        </Body>
      </Card>

      {nav.viewer && viewerPlace && (
        <PhotoViewer
          title={viewerPlace.name}
          subtitle={[countryName(viewerPlace.countryCode), formatDate(viewerPlace.date)].filter(Boolean).join(" · ")}
          photoIds={viewerPlace.photos}
          startIndex={nav.viewer.index}
          autoplay={nav.viewer.autoplay}
          onClose={nav.closeViewer}
          onDelete={(photoId) => actions.removePhoto(viewerPlace.id, photoId)}
        />
      )}

      {toast.toast && <Toast key={toast.toast.id} toast={toast.toast} onUndo={toast.undo} onDismiss={toast.dismiss} />}
    </Frame>
  );
}
