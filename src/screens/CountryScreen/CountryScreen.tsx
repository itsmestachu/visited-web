import type { CountryEntry } from "../../store/store.types";
import { formatDate } from "../../utils/dates";
import { Button } from "../../components/Button/Button";
import { DateField } from "../../components/DateField/DateField";
import { NoteField } from "../../components/NoteField/NoteField";
import { StatusSwitch } from "../../components/StatusSwitch/StatusSwitch";
import { ColorPicker } from "../../components/ColorPicker/ColorPicker";
import { ScreenHeader } from "../../components/ScreenHeader/ScreenHeader";
import { List, ListRow } from "../../components/ListRow/ListRow";
import { PinMarker } from "../../components/Marker/Marker";
import { ButtonRow, Muted, ScreenLayout, Section } from "../../components/ScreenLayout/ScreenLayout";
import { useCountryInfo } from "./CountryScreen.hooks";
import type { CountryScreenProps } from "./CountryScreen.types";

export function CountryScreen({
  code,
  entry,
  places,
  dispatch,
  onBack,
  onFocus,
  onOpenPlace,
  onRemove,
  onRemovePlace,
}: CountryScreenProps) {
  const { name, subtitle } = useCountryInfo(code);
  const update = (patch: Partial<CountryEntry>) => dispatch({ type: "updateCountry", code, patch });

  return (
    <ScreenLayout>
      <ScreenHeader
        title={name}
        subtitle={subtitle}
        onBack={onBack}
        onFocus={onFocus}
        onDelete={entry ? onRemove : undefined}
        deleteLabel={`Odznacz ${name}`}
      />

      {!entry ? (
        <>
          <Muted>Ten kraj nie jest jeszcze zaznaczony.</Muted>
          <ButtonRow>
            <Button variant="primary" onClick={() => dispatch({ type: "ensureCountry", code, status: "visited" })}>
              ✓ Byłem tu
            </Button>
            <Button variant="outline" onClick={() => dispatch({ type: "ensureCountry", code, status: "wish" })}>
              ★ Chcę pojechać
            </Button>
          </ButtonRow>
        </>
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

      <Section title="Miasta" count={places.length}>
        {places.length === 0 ? (
          <Muted>Przybliż mapę i kliknij kropkę miasta, żeby postawić pinezkę.</Muted>
        ) : (
          <List>
            {places.map((p) => (
              <ListRow
                key={p.id}
                marker={<PinMarker status={p.status} />}
                title={p.name}
                meta={[formatDate(p.date), p.photos.length ? `${p.photos.length} zdj.` : ""].filter(Boolean).join(" · ")}
                onClick={() => onOpenPlace(p.id)}
                onDelete={() => onRemovePlace(p.id)}
              />
            ))}
          </List>
        )}
      </Section>
    </ScreenLayout>
  );
}
