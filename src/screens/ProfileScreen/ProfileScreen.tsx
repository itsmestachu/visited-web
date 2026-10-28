import { useMemo } from "react";
import type { CityIndex } from "../../data/cities";
import { Muted, ScreenLayout, Section } from "../../components/ScreenLayout/ScreenLayout";
import { Segmented } from "../../components/Segmented/Segmented";
import { CITY_POPULATION_STEPS, formatPopulation, type Settings } from "../../services/settings/settings";
import { plural } from "../../utils/text";
import { SettingLabel, Slider, SoonBadge, Ticks } from "./ProfileScreen.styles";

type Props = {
  settings: Settings;
  cities: CityIndex | null;
  onSettings: (patch: Partial<Settings>) => void;
};

const LANGUAGES = [
  { value: "pl" as const, label: "Polski" },
  { value: "en" as const, label: "English", disabled: true, hint: "Wkrótce" },
];

export function ProfileScreen({ settings, cities, onSettings }: Props) {
  const stepIndex = Math.max(0, CITY_POPULATION_STEPS.indexOf(settings.minCityPopulation));
  const shown = useMemo(
    () => (cities ? cities.list.filter((c) => c.population >= settings.minCityPopulation).length : null),
    [cities, settings.minCityPopulation],
  );

  return (
    <ScreenLayout>
      <Section title="Konto">
        <SoonBadge>Wkrótce</SoonBadge>
        <Muted>
          Na razie wszystko zapisuje się tylko w tej przeglądarce. Z kontem Twoja mapa będzie dostępna na każdym urządzeniu i
          będzie można ją pokazać znajomym.
        </Muted>
      </Section>

      <Section title="Planer">
        <SoonBadge>Wkrótce</SoonBadge>
        <Muted>Tu zaplanujesz wyjazdy: miejsca, trasę i plan dnia po dniu.</Muted>
      </Section>

      <Section title="Ustawienia">
        <SettingLabel htmlFor="min-city-population">
          Miasta na mapie od
          <strong>{settings.minCityPopulation ? `${formatPopulation(settings.minCityPopulation)} mieszkańców` : "wszystkie"}</strong>
        </SettingLabel>
        <Slider
          id="min-city-population"
          type="range"
          min={0}
          max={CITY_POPULATION_STEPS.length - 1}
          step={1}
          value={stepIndex}
          onChange={(e) => onSettings({ minCityPopulation: CITY_POPULATION_STEPS[Number(e.target.value)] })}
        />
        <Ticks aria-hidden="true">
          <span>wszystkie</span>
          <span>{formatPopulation(CITY_POPULATION_STEPS[CITY_POPULATION_STEPS.length - 1])}</span>
        </Ticks>
        <Muted>
          {shown !== null && `${shown.toLocaleString("pl-PL")} ${plural(shown, "miasto", "miasta", "miast")} do wyboru na mapie. `}
          Miasta, które zaznaczyłeś, są widoczne zawsze.
        </Muted>
      </Section>

      <Section title="Język">
        <Segmented options={LANGUAGES} value="pl" onChange={() => undefined} />
      </Section>

      <Section title="Prywatność">
        <Muted>
          Twoje kraje, miasta i zdjęcia są zapisane tylko w tej przeglądarce i nie są nigdzie wysyłane. Pełna polityka
          prywatności pojawi się razem z kontami.
        </Muted>
      </Section>
    </ScreenLayout>
  );
}
