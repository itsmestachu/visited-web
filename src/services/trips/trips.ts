import type { City, Landmark, UnescoSite } from "../../data/data.types";
import { LANDMARK_LABEL } from "../../data/landmarks";
import type { Place, Trip, TripStop } from "../../store/store.types";
import { formatDate } from "../../utils/dates";
import { plural } from "../../utils/text";

const DAY_MS = 86_400_000;
const MAX_DAYS = 60;

export const newTrip = (): Trip => ({
  id: crypto.randomUUID(),
  name: "Nowy wyjazd",
  status: "planned",
  days: 1,
  stops: [],
  checklist: [],
  createdAt: Date.now(),
});

export const stopFromCity = (city: City, day: number): TripStop => ({
  id: crypto.randomUUID(),
  name: city.namePl,
  countryCode: city.countryCode,
  lat: city.lat,
  lng: city.lng,
  day,
  cityId: city.id,
});

export const stopFromPlace = (place: Place, day: number): TripStop => ({
  id: crypto.randomUUID(),
  name: place.name,
  countryCode: place.countryCode,
  lat: place.lat,
  lng: place.lng,
  day,
  cityId: place.cityId,
});

export const stopFromLandmark = (landmark: Landmark, day: number): TripStop => ({
  id: crypto.randomUUID(),
  name: landmark.name,
  countryCode: landmark.countryCode,
  lat: landmark.lat,
  lng: landmark.lng,
  day,
  kind: LANDMARK_LABEL[landmark.category],
});

export const stopFromSite = (site: UnescoSite, day: number): TripStop => ({
  id: crypto.randomUUID(),
  name: site.name,
  countryCode: site.countryCodes[0],
  lat: site.lat,
  lng: site.lng,
  day,
  siteId: site.id,
});

const parseDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const daysBetween = (start: string, end: string) => Math.round((parseDay(end) - parseDay(start)) / DAY_MS) + 1;

export const clampDays = (n: number) => Math.min(MAX_DAYS, Math.max(1, n));

// Applies new dates; a full range also fixes the number of days, and stops past the last day move onto it.
export const withDates = (trip: Trip, startDate: string | undefined, endDate: string | undefined): Partial<Trip> => {
  const validRange = startDate && endDate && daysBetween(startDate, endDate) >= 1;
  const days = validRange ? clampDays(daysBetween(startDate, endDate)) : trip.days;
  return {
    startDate,
    endDate: validRange || !startDate ? endDate : undefined,
    days,
    stops: trip.stops.map((s) => (s.day > days ? { ...s, day: days } : s)),
  };
};

export const withDays = (trip: Trip, days: number): Partial<Trip> => {
  const next = clampDays(days);
  return {
    days: next,
    endDate: trip.startDate && trip.endDate ? isoDay(parseDay(trip.startDate) + (next - 1) * DAY_MS) : trip.endDate,
    stops: trip.stops.map((s) => (s.day > next ? { ...s, day: next } : s)),
  };
};

const weekdayFormat = new Intl.DateTimeFormat("pl-PL", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" });

export const dayLabel = (trip: Pick<Trip, "startDate">, day: number) => {
  const base = `Dzień ${day}`;
  if (!trip.startDate) return base;
  return `${base} · ${weekdayFormat.format(new Date(parseDay(trip.startDate) + (day - 1) * DAY_MS))}`;
};

export const tripDates = (trip: Pick<Trip, "startDate" | "endDate">) => {
  if (!trip.startDate) return "";
  if (!trip.endDate || trip.endDate === trip.startDate) return formatDate(trip.startDate);
  return `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`;
};

export const tripSummary = (trip: Pick<Trip, "days" | "stops" | "startDate" | "endDate">) =>
  [
    tripDates(trip),
    `${trip.days} ${plural(trip.days, "dzień", "dni", "dni")}`,
    `${trip.stops.length} ${plural(trip.stops.length, "miejsce", "miejsca", "miejsc")}`,
  ]
    .filter(Boolean)
    .join(" · ");

// Stops in travel order: by day, keeping the user's order within a day.
export const orderedStops = (stops: TripStop[]) =>
  stops
    .map((stop, index) => ({ stop, index }))
    .sort((a, b) => a.stop.day - b.stop.day || a.index - b.index)
    .map(({ stop }) => stop);
