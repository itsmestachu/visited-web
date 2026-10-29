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
  WIKI_PAGE,
} from "../../services/nearby/nearby";
import {
  Actions,
  AddButton,
  Body,
  Credit,
  Desc,
  Group,
  GroupHead,
  Item,
  Meta,
  MoreButton,
  Name,
  Scroll,
  Thumb,
  Toggle,
  Toggles,
} from "./NearbyDialog.styles";

type Props = {
  stop: TripStop;
  planned: TripStop[];
  onAdd?: (place: NearbyPlace) => void;
  onClose: () => void;
};

// Noclegi and jedzenie are switched off for now: the public OpenStreetMap servers they rely on keep timing out.
const CATEGORIES: NearbyCategory[] = [/* "sleep", "eat", */ "see"];
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
  const [count, setCount] = useState(WIKI_PAGE);
  const keyOf = (category: NearbyCategory, n = count) => `${category}:${range}:${category === "see" ? n : 0}`;

  useEffect(() => {
    let alive = true;
    for (const category of active) {
      const key = `${category}:${range}:${category === "see" ? count : 0}`;
      void fetchNearby(category, stop.lat, stop.lng, RADIUS[range][category], count, (result) => {
        if (alive) setResults((r) => ({ ...r, [key]: result }));
      });
    }
    return () => {
      alive = false;
    };
  }, [active, range, count, stop.lat, stop.lng, attempt]);

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
        {CATEGORIES.length > 1 && (
          <Toggles>
            {CATEGORIES.map((c) => (
              <Toggle key={c} type="button" $on={active.includes(c)} aria-pressed={active.includes(c)} onClick={() => toggle(c)}>
                {CATEGORY_LABEL[c]}
              </Toggle>
            ))}
          </Toggles>
        )}
        <Segmented
          options={RANGES}
          value={range}
          onChange={(next) => {
            setRange(next);
            setCount(WIKI_PAGE);
          }}
          size="small"
        />

        <Scroll>
          {active.length === 0 && <Muted>Włącz noclegi, jedzenie albo miejsca warte zobaczenia.</Muted>}
          {active.map((category) => {
            // While the next page loads, keep showing what is already on screen.
            const current = results[keyOf(category)];
            const result = current ?? (count > WIKI_PAGE ? results[keyOf(category, count - WIKI_PAGE)] : undefined);
            const loadingMore = !current && result !== undefined;
            return (
              <Group key={category}>
                <GroupHead>
                  {CATEGORY_LABEL[category]} · do {formatDistance(RADIUS[range][category])}
                </GroupHead>
                {!result && <Muted>Szukam…</Muted>}
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
                {category === "see" && result?.hasMore && (
                  <MoreButton variant="outline" disabled={loadingMore} onClick={() => setCount((n) => n + WIKI_PAGE)}>
                    {loadingMore ? "Wczytuję…" : "Pokaż więcej"}
                  </MoreButton>
                )}
                {category === "see" && result && !result.hasMore && result.places.length > 0 && range !== "far" && (
                  <Muted>To wszystko w tej odległości. Wybierz „Daleko”, żeby szukać dalej.</Muted>
                )}
              </Group>
            );
          })}
        </Scroll>
        {/* With noclegi/jedzenie back: Dane: © współtwórcy OpenStreetMap (ODbL), Wikipedia (CC BY-SA). */}
        <Credit>Dane: Wikipedia (CC BY-SA).</Credit>
      </Dialog>
    </Overlay>,
    document.body,
  );
}
