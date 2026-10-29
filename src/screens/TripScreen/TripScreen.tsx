import { useCallback, useState } from "react";
import type { NearbyPlace } from "../../services/nearby/nearby";
import { NearbyDialog } from "./NearbyDialog";
import { countryName } from "../../data/countries";
import type { TripStop } from "../../store/store.types";
import { Button } from "../../components/Button/Button";
import { Field } from "../../components/Field/Field";
import { Input } from "../../components/Field/Field.styles";
import { NoteField } from "../../components/NoteField/NoteField";
import { ScreenHeader } from "../../components/ScreenHeader/ScreenHeader";
import { Segmented } from "../../components/Segmented/Segmented";
import { Muted, ScreenLayout, Section } from "../../components/ScreenLayout/ScreenLayout";
import {
  dayLabel,
  orderedStops,
  stopFromCity,
  stopFromLandmark,
  stopFromSite,
  tripSummary,
  withDates,
  withDays,
} from "../../services/trips/trips";
import { StopSearch } from "./StopSearch";
import {
  Banner,
  Check,
  Chip,
  Chips,
  DayBox,
  DayHead,
  DayStepper,
  NearbyLink,
  Note,
  Row,
  Stop,
  StopNumber,
  Stops,
  StopText,
  StopTools,
  ToolButton,
} from "./TripScreen.styles";
import type { TripScreenProps } from "./TripScreen.types";

const TRIP_STATUS = [
  { value: "planned" as const, label: "★ Planowany", tone: "wish" as const },
  { value: "done" as const, label: "✓ Odbyty", tone: "red" as const },
];

const stopKey =(s: Pick<TripStop, "cityId" | "siteId" | "name">) =>
  s.siteId ? `s-${s.siteId}` : s.cityId ? `c-${s.cityId}` : `n-${s.name}`;

export function TripScreen({
  trip,
  shared,
  cities,
  unesco,
  landmarks,
  suggestions,
  shareMessage,
  onChange,
  onBack,
  onFocus,
  onDelete,
  onShare,
  onSave,
}: TripScreenProps) {
  const [targetDay, setTargetDay] = useState(trip.days);
  const [newItem, setNewItem] = useState("");
  const [nearbyFor, setNearbyFor] = useState<TripStop | null>(null);
  const closeNearby = useCallback(() => setNearbyFor(null), []);
  const addDay = Math.min(targetDay, trip.days);
  const editable = !shared;
  const ordered = orderedStops(trip.stops);
  const number = new Map(ordered.map((s, i) => [s.id, i + 1]));
  const taken = new Set(trip.stops.map(stopKey));
  const freshSuggestions = suggestions.filter((s) => !taken.has(s.key));
  const fullRange = Boolean(trip.startDate && trip.endDate);

  const addStop = (stop: TripStop) => {
    if (!taken.has(stopKey(stop))) onChange({ stops: [...trip.stops, stop] });
  };

  const moveStop = (stop: TripStop, direction: -1 | 1) => {
    const sameDay = trip.stops.filter((s) => s.day === stop.day);
    const neighbour = sameDay[sameDay.indexOf(stop) + direction];
    if (!neighbour) return;
    const stops = [...trip.stops];
    const a = stops.indexOf(stop);
    const b = stops.indexOf(neighbour);
    [stops[a], stops[b]] = [stops[b], stops[a]];
    onChange({ stops });
  };

  // Places found nearby go right after their city (and after earlier finds), on the same day.
  const addNearby = (from: TripStop, place: NearbyPlace) => {
    const stop: TripStop = {
      id: crypto.randomUUID(),
      name: place.name,
      countryCode: from.countryCode,
      lat: place.lat,
      lng: place.lng,
      day: from.day,
      kind: place.kind,
    };
    const stops = [...trip.stops];
    let at = stops.findIndex((s) => s.id === from.id) + 1;
    while (at < stops.length && stops[at].day === from.day && stops[at].kind) at++;
    stops.splice(at, 0, stop);
    onChange({ stops });
  };

  const updateStop = (id: string, patch: Partial<TripStop>) =>
    onChange({ stops: trip.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const addChecklistItem = () => {
    const text = newItem.trim();
    if (!text) return;
    onChange({ checklist: [...trip.checklist, { id: crypto.randomUUID(), text, done: false }] });
    setNewItem("");
  };

  return (
    <ScreenLayout>
      {nearbyFor && (
        <NearbyDialog
          stop={nearbyFor}
          planned={trip.stops}
          onAdd={editable ? (place) => addNearby(nearbyFor, place) : undefined}
          onClose={closeNearby}
        />
      )}
      <ScreenHeader
        title={trip.name}
        subtitle={tripSummary(trip)}
        onBack={onBack}
        onFocus={onFocus}
        onDelete={onDelete}
        deleteLabel={`Usuń plan ${trip.name}`}
      />

      {shared ? (
        <Banner>
          Ktoś udostępnił Ci ten plan. Zapisz go u siebie, żeby go edytować.
          <Button variant="primary" onClick={onSave}>
            Zapisz w moich planach
          </Button>
        </Banner>
      ) : (
        <>
          <Segmented
            options={TRIP_STATUS}
            value={trip.status}
            onChange={(status) => onChange({ status })}
          />
          <Field label="Nazwa">
            <Input value={trip.name} maxLength={120} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
          <Row>
            <Field label="Od">
              <Input
                type="date"
                value={trip.startDate ?? ""}
                onChange={(e) => onChange(withDates(trip, e.target.value || undefined, trip.endDate))}
              />
            </Field>
            <Field label="Do">
              <Input
                type="date"
                value={trip.endDate ?? ""}
                min={trip.startDate}
                onChange={(e) => onChange(withDates(trip, trip.startDate, e.target.value || undefined))}
              />
            </Field>
          </Row>
          {!fullRange && (
            <DayStepper>
              Liczba dni
              <Button variant="outline" disabled={trip.days <= 1} onClick={() => onChange(withDays(trip, trip.days - 1))}>
                −
              </Button>
              <strong>{trip.days}</strong>
              <Button variant="outline" onClick={() => onChange(withDays(trip, trip.days + 1))}>
                +
              </Button>
            </DayStepper>
          )}

          <Field
            label="Dodaj miejsce"
            action={
              trip.days > 1 && (
                <StopTools>
                  <select value={addDay} onChange={(e) => setTargetDay(Number(e.target.value))} aria-label="Do którego dnia">
                    {Array.from({ length: trip.days }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        do dnia {i + 1}
                      </option>
                    ))}
                  </select>
                </StopTools>
              )
            }
          >
            <StopSearch
              cities={cities}
              unesco={unesco}
              landmarks={landmarks}
              placeholder="Miasto, atrakcja albo miejsce UNESCO…"
              onPick={(r) =>
                addStop(
                  r.kind === "city"
                    ? stopFromCity(r.city, addDay)
                    : r.kind === "landmark"
                      ? stopFromLandmark(r.landmark, addDay)
                      : stopFromSite(r.site, addDay),
                )
              }
            />
            {freshSuggestions.length > 0 && (
              <Chips>
                {freshSuggestions.slice(0, 12).map((s) => (
                  <Chip key={s.key} type="button" onClick={() => addStop(s.toStop(addDay))} title="Dodaj z listy marzeń">
                    ★ {s.label}
                  </Chip>
                ))}
              </Chips>
            )}
          </Field>
        </>
      )}

      <Section title="Plan" count={trip.stops.length}>
        {trip.stops.length === 0 && <Muted>Dodaj miasta i miejsca, które chcesz zobaczyć. Trasa pojawi się na mapie.</Muted>}
        {Array.from({ length: trip.days }, (_, i) => i + 1).map((day) => {
          const stops = trip.stops.filter((s) => s.day === day);
          if (stops.length === 0 && (shared || trip.days === 1)) return null;
          return (
            <DayBox key={day}>
              <DayHead>{dayLabel(trip, day)}</DayHead>
              {stops.length === 0 ? (
                <Muted>Nic jeszcze nie zaplanowano.</Muted>
              ) : (
                <Stops>
                  {stops.map((stop, i) => (
                    <Stop key={stop.id}>
                      <StopNumber $site={Boolean(stop.siteId)}>{number.get(stop.id)}</StopNumber>
                      <StopText>
                        <span>{stop.name}</span>
                        <small>
                          {[countryName(stop.countryCode), stop.siteId ? "UNESCO" : "", stop.kind].filter(Boolean).join(" · ")}
                          {!stop.kind && (
                            <>
                              {" · "}
                              <NearbyLink type="button" onClick={() => setNearbyFor(stop)}>
                                Co w okolicy
                              </NearbyLink>
                            </>
                          )}
                        </small>
                      </StopText>
                      {editable && (
                        <StopTools>
                          <ToolButton type="button" disabled={i === 0} onClick={() => moveStop(stop, -1)} aria-label="W górę">
                            ↑
                          </ToolButton>
                          <ToolButton
                            type="button"
                            disabled={i === stops.length - 1}
                            onClick={() => moveStop(stop, 1)}
                            aria-label="W dół"
                          >
                            ↓
                          </ToolButton>
                          {trip.days > 1 && (
                            <select
                              value={stop.day}
                              onChange={(e) => updateStop(stop.id, { day: Number(e.target.value) })}
                              aria-label={`Dzień dla ${stop.name}`}
                            >
                              {Array.from({ length: trip.days }, (_, d) => (
                                <option key={d + 1} value={d + 1}>
                                  dz. {d + 1}
                                </option>
                              ))}
                            </select>
                          )}
                          <ToolButton
                            type="button"
                            onClick={() => onChange({ stops: trip.stops.filter((s) => s.id !== stop.id) })}
                            aria-label={`Usuń ${stop.name}`}
                          >
                            ✕
                          </ToolButton>
                        </StopTools>
                      )}
                    </Stop>
                  ))}
                </Stops>
              )}
            </DayBox>
          );
        })}
      </Section>

      {(editable || trip.checklist.length > 0) && (
        <Section title="Do spakowania i załatwienia" count={trip.checklist.length || undefined}>
          <Stops>
            {trip.checklist.map((item) => (
              <Stop key={item.id}>
                <Check $done={item.done}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    disabled={!editable}
                    onChange={() =>
                      onChange({ checklist: trip.checklist.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)) })
                    }
                  />
                  {item.text}
                </Check>
                {editable && (
                  <ToolButton
                    type="button"
                    onClick={() => onChange({ checklist: trip.checklist.filter((c) => c.id !== item.id) })}
                    aria-label={`Usuń ${item.text}`}
                  >
                    ✕
                  </ToolButton>
                )}
              </Stop>
            ))}
          </Stops>
          {editable && (
            <Input
              placeholder="Np. paszport, rezerwacja hotelu… (Enter dodaje)"
              value={newItem}
              maxLength={300}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
            />
          )}
        </Section>
      )}

      {editable ? (
        <NoteField value={trip.note} onChange={(note) => onChange({ note })} />
      ) : (
        trip.note && (
          <Section title="Notatka">
            <Note>{trip.note}</Note>
          </Section>
        )
      )}

      {editable && (
        <Section title="Udostępnij">
          <Muted>
            Link zawiera cały plan. Osoba, która go otworzy, zobaczy trasę i będzie mogła zapisać plan u siebie. Późniejsze
            zmiany nie trafią do niej same: wyślij wtedy nowy link.
          </Muted>
          <Button variant="primary" onClick={onShare}>
            Udostępnij plan
          </Button>
          {shareMessage && <Muted>{shareMessage}</Muted>}
        </Section>
      )}
    </ScreenLayout>
  );
}
