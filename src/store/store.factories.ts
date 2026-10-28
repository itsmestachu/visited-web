import type { City } from "../data/data.types";
import type { Place, Status } from "./store.types";

export const placeFromCity = (city: City, status: Status): Place => ({
  id: crypto.randomUUID(),
  cityId: city.id,
  name: city.namePl,
  countryCode: city.countryCode,
  lat: city.lat,
  lng: city.lng,
  status,
  photos: [],
  createdAt: Date.now(),
});
