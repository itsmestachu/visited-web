import { useMemo } from "react";
import { countryName } from "../../data/countries";
import type { AppData, Place, Trip, TripStop } from "../../store/store.types";
import { tripDates } from "../../services/trips/trips";
import { formatDate } from "../../utils/dates";

export type Memory = {
  id: string;
  title: string;
  subtitle: string;
  planned: boolean;
  photoIds: string[];
  stops: TripStop[];
  sortKey: string;
  open: { kind: "trip"; id: string } | { kind: "place"; id: string };
};

const sameCity = (place: Place, stop: TripStop) =>
  place.countryCode === stop.countryCode && (stop.cityId !== undefined ? place.cityId === stop.cityId : place.name === stop.name);

// A trip's photos are the photos of the visited cities on its route, so nothing is stored twice.
const tripPlaces = (trip: Trip, places: Place[]) =>
  places.filter((p) => p.status === "visited" && trip.stops.some((s) => sameCity(p, s)));

const placeStop = (p: Place): TripStop => ({ id: p.id, name: p.name, countryCode: p.countryCode, lat: p.lat, lng: p.lng, day: 1 });

export const useMemories = (data: AppData) =>
  useMemo(() => {
    const places = Object.values(data.places);
    const trips = Object.values(data.trips);
    const inDoneTrips = new Set<string>();

    const tripMemories: Memory[] = trips.map((trip) => {
      const own = tripPlaces(trip, places);
      if (trip.status === "done") own.forEach((p) => inDoneTrips.add(p.id));
      const countries = [...new Set(trip.stops.map((s) => countryName(s.countryCode)))].join(", ");
      return {
        id: `trip-${trip.id}`,
        title: trip.name,
        subtitle: [tripDates(trip), countries].filter(Boolean).join(" · "),
        planned: trip.status === "planned",
        photoIds: trip.status === "done" ? own.flatMap((p) => p.photos) : [],
        stops: trip.stops,
        sortKey: trip.startDate ?? new Date(trip.createdAt).toISOString().slice(0, 10),
        open: { kind: "trip", id: trip.id },
      };
    });

    const placeMemories: Memory[] = places
      .filter((p) => p.status === "visited" && p.photos.length > 0 && !inDoneTrips.has(p.id))
      .map((p) => ({
        id: `place-${p.id}`,
        title: p.name,
        subtitle: [formatDate(p.date), countryName(p.countryCode)].filter(Boolean).join(" · "),
        planned: false,
        photoIds: p.photos,
        stops: [placeStop(p)],
        sortKey: p.date ?? new Date(p.createdAt).toISOString().slice(0, 10),
        open: { kind: "place", id: p.id },
      }));

    const byDateDesc = (a: Memory, b: Memory) => b.sortKey.localeCompare(a.sortKey);
    return [
      ...tripMemories.filter((m) => m.planned).sort((a, b) => a.sortKey.localeCompare(b.sortKey)),
      ...[...tripMemories.filter((m) => !m.planned), ...placeMemories].sort(byDateDesc),
    ];
  }, [data.places, data.trips]);

// Stable pseudo-random tilt per card, so the wall looks hand-pinned but doesn't reshuffle on every render.
export const tiltFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 50) - 25) / 10;
};
