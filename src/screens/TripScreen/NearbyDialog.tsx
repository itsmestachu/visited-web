import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { countryName } from "../../data/countries";
import type { TripStop } from "../../store/store.types";
import { Button } from "../../components/Button/Button";
import { ErrorText, Muted } from "../../components/ScreenLayout/ScreenLayout";
import { Segmented } from "../../components/Segmented/Segmented";
import { Dialog, Head, Overlay, Title } from "../../components/SharePoster/SharePoster.styles";
import {
  CATEGORY_LABEL,
  distanceM,
  fetchNearby,
  formatDistance,
  googleMapsUrl,
  RADIUS,
  RANGE_LABEL,
  type NearbyCategory,
  type NearbyPlace,
  type NearbyRange,
  type NearbyResult,
} from "../../services/nearby/nearby";
import { Actions, AddButton, Body, Credit, Desc, Group, GroupHead, Item, Meta, Name, Scroll, Thumb, Toggle, Toggles } from "./NearbyDialog.styles";

type Props = {
  stop: TripStop;
  planned: TripStop[];
  onAdd?: (place: NearbyPlace) => void;
  onClose: () => void;
};

const CATEGORIES: NearbyCategory[] = ["sleep", "eat", "see"];
const RANGES = (["near", "mid", "far"] as NearbyRange[]).map((value) => ({ value, label: RANGE_LABEL[value] }));

// Links come from OpenStreetMap contributors, so only plain web addresses are rendered.
const safeUrl = (url: string | undefined) => (url && /^https?:\/\//i.test(url) ? url : undefined);

const isPlanned = (place: NearbyPlace, planned: TripStop[]) =>
  planned.some((s) => s.name === place.name && distanceM(s.lat, s.lng, place.lat, place.lng) < 100);

export function NearbyDialog({ stop, planned, onAdd, onClose }: Props) {
  const [active, setActive] = useState<NearbyCategory[]>(["see"]);
  const [range, setRange] = useState<NearbyRange>("mid");
  const [results, setResults] = useState<Record<string, NearbyResult>>({});
  const [attempt, setAttempt] = useState(0);
  const keyOf = (category: NearbyCategory) => `${category}:${range}`;

  useEffect(() => {
    let alive = true;
    for (const category of active) {
      const key = `${category}:${range}`;
      void fetchNearby(category, stop.lat, stop.lng, RADIUS[range][category], (result) => {
        if (alive) setResults((r) => ({ ...r, [key]: result }));
      });
    }
    return () => {
      alive = false;
    };
  }, [active, range, stop.lat, stop.lng, attempt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (category: NearbyCategory) =>
    setActive((a) => (a.includes(category) ? a.filter((c) => c !== category) : CATEGORIES.filter((c) => c === category || a.includes(c))));

  const retry = (key: string) => {
    setResults(({ [key]: _failed, ...rest }) => rest);
    setAttempt((n) => n + 1);
  };

  return createPortal(
    <Overlay role="dialog" aria-modal="true" aria-label={`Co w okolicy: ${stop.name}`} onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Head>
          <Title>Co w okolicy: {stop.name}</Title>
          <Button variant="icon" onClick={onClose} aria-label="Zamknij">
            ✕
          </Button>
        </Head>
        <Toggles>
          {CATEGORIES.map((c) => (
            <Toggle key={c} type="button" $on={active.includes(c)} aria-pressed={active.includes(c)} onClick={() => toggle(c)}>
              {CATEGORY_LABEL[c]}
            </Toggle>
          ))}
        </Toggles>
        <Segmented options={RANGES} value={range} onChange={setRange} size="small" />

        <Scroll>
          {active.length === 0 && <Muted>Włącz noclegi, jedzenie albo miejsca warte zobaczenia.</Muted>}
          {active.map((category) => {
            const result = results[keyOf(category)];
            return (
              <Group key={category}>
                <GroupHead>
                  {CATEGORY_LABEL[category]} · do {formatDistance(RADIUS[range][category])}
                </GroupHead>
                {!result && <Muted>Szukam… Serwery OpenStreetMap czasem odpowiadają kilkanaście sekund.</Muted>}
                {result?.error && (
                  <ErrorText>
                    {result.error}{" "}
                    <Button variant="link" onClick={() => retry(keyOf(category))}>
                      Spróbuj ponownie
                    </Button>
                  </ErrorText>
                )}
                {result && !result.loading && !result.error && result.places.length === 0 && (
                  <Muted>Nic nie znaleziono. Spróbuj większej odległości.</Muted>
                )}
                {result?.loading && <Muted>Doczytuję więcej z OpenStreetMap…</Muted>}
                {result?.places.map((place) => {
                  const added = isPlanned(place, planned);
                  const website = safeUrl(place.website);
                  const wiki = safeUrl(place.wikiUrl);
                  return (
                    <Item key={place.id}>
                      {place.image && <Thumb src={place.image} alt="" loading="lazy" />}
                      <Body>
                        <Name>{place.name}</Name>
                        <Meta>
                          {place.kind} · {formatDistance(place.distance)}
                        </Meta>
                        {place.openingHours && <Meta>Godziny: {place.openingHours}</Meta>}
                        {place.description && <Desc>{place.description}</Desc>}
                        <Actions>
                          {onAdd && (
                            <AddButton type="button" $added={added} disabled={added} onClick={() => onAdd(place)}>
                              {added ? "✓ W planie" : "+ Do planu"}
                            </AddButton>
                          )}
                          <a href={googleMapsUrl(place.name, `${stop.name}, ${countryName(stop.countryCode)}`)} target="_blank" rel="noopener noreferrer">
                            Google Maps ↗
                          </a>
                          {website && (
                            <a href={website} target="_blank" rel="noopener noreferrer nofollow">
                              Strona ↗
                            </a>
                          )}
                          {wiki && (
                            <a href={wiki} target="_blank" rel="noopener noreferrer">
                              Wikipedia ↗
                            </a>
                          )}
                        </Actions>
                      </Body>
                    </Item>
                  );
                })}
              </Group>
            );
          })}
        </Scroll>
        <Credit>Dane: © współtwórcy OpenStreetMap (ODbL), Wikipedia (CC BY-SA).</Credit>
      </Dialog>
    </Overlay>,
    document.body,
  );
}
