import type { CountryEntry, Place } from "../../types/models";
import type { Dispatch } from "../../store/actions";
import { countryByCode } from "../../data/countries";
import { CONTINENT_NAMES } from "../../constants/continents";
import { formatDate } from "../../utils/dates";
import { Button } from "../../ui/Button";
import { Field } from "../../ui/Field";
import { DateField } from "../../components/form/DateField";
import { NoteField } from "../../components/form/NoteField";
import { StatusSwitch } from "../../components/form/StatusSwitch";
import { ColorPicker } from "../../components/form/ColorPicker";
import { List, ListRow } from "../../components/lists/ListRow";
import { PinMarker } from "../../components/lists/Markers";
import { ScreenHeader } from "../ScreenHeader";

type Props = {
  code: string;
  entry: CountryEntry | undefined;
  places: Place[];
  dispatch: Dispatch;
  onBack: () => void;
  onOpenPlace: (id: string) => void;
  onFocus: () => void;
};

export function CountryScreen({ code, entry, places, dispatch, onBack, onOpenPlace, onFocus }: Props) {
  const country = countryByCode.get(code);
  const update = (patch: Partial<CountryEntry>) => dispatch({ type: "updateCountry", code, patch });
  const subtitle = [
    country?.continent ? CONTINENT_NAMES[country.continent] : "",
    country && country.nameEn !== country.name ? country.nameEn : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="screen">
      <ScreenHeader title={country?.name ?? code} subtitle={subtitle} onBack={onBack} onFocus={onFocus} />

      {!entry ? (
        <Field label="Status">
          <p className="muted">Ten kraj nie jest jeszcze zaznaczony.</p>
          <div className="row">
            <Button variant="primary" onClick={() => dispatch({ type: "ensureCountry", code, status: "visited" })}>
              ✓ Odwiedzone
            </Button>
            <Button variant="secondary" onClick={() => dispatch({ type: "ensureCountry", code, status: "wish" })}>
              ★ Chcę odwiedzić
            </Button>
          </div>
        </Field>
      ) : (
        <>
          <StatusSwitch value={entry.status} onChange={(status) => update({ status })} />
          {entry.status === "visited" && <ColorPicker value={entry.color} onChange={(color) => update({ color })} />}
          <DateField
            key={`date-${code}`}
            label={entry.status === "visited" ? "Kiedy byłeś" : "Planowany termin"}
            value={entry.date}
            onChange={(date) => update({ date })}
          />
          <NoteField value={entry.note} onChange={(note) => update({ note })} />
        </>
      )}

      <Field label={`Miasta${places.length ? ` (${places.length})` : ""}`}>
        {places.length === 0 ? (
          <p className="muted">Kliknij miasto na mapie albo znajdź je w wyszukiwarce.</p>
        ) : (
          <List>
            {places.map((p) => (
              <ListRow
                key={p.id}
                marker={<PinMarker status={p.status} />}
                title={p.name}
                meta={[formatDate(p.date), p.photos.length ? `${p.photos.length} zdj.` : ""].filter(Boolean).join(" · ")}
                onClick={() => onOpenPlace(p.id)}
              />
            ))}
          </List>
        )}
      </Field>

      {entry && (
        <Button
          variant="danger"
          onClick={() => {
            dispatch({ type: "removeCountry", code });
            onBack();
          }}
        >
          Usuń kraj
        </Button>
      )}
    </div>
  );
}
