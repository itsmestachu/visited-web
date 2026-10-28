import type { CountryEntry, Dispatch, Place } from "./store";
import { PALETTE, randomColor } from "./store";
import { countryByCode, CONTINENT_NAMES } from "./countries";
import { hasRegions } from "./regions";
import { DateField } from "./DateField";
import { formatDate } from "./dates";
import { NoteField } from "./NoteField";
import { StatusSwitch } from "./StatusSwitch";
import { RegionPicker } from "./RegionPicker";

type Props = {
  code: string;
  entry: CountryEntry | undefined;
  places: Place[];
  dispatch: Dispatch;
  onBack: () => void;
  onOpenPlace: (id: string) => void;
  onFocus: () => void;
};

export function CountryDetail({ code, entry, places, dispatch, onBack, onOpenPlace, onFocus }: Props) {
  const country = countryByCode.get(code);
  const update = (patch: Partial<CountryEntry>) => dispatch({ type: "updateCountry", code, patch });

  return (
    <div className="detail">
      <button type="button" className="back" onClick={onBack}>
        ← Wróć
      </button>
      <div className="detail-head">
        <div>
          <h2>{country?.name ?? code}</h2>
          <span className="muted">
            {country?.continent ? CONTINENT_NAMES[country.continent] : ""}
            {country && country.nameEn !== country.name ? ` · ${country.nameEn}` : ""}
          </span>
        </div>
        <button type="button" className="icon-button" onClick={onFocus} aria-label="Pokaż na mapie">
          ⌖
        </button>
      </div>

      {!entry ? (
        <div className="field">
          <p className="muted">Ten kraj nie jest jeszcze zaznaczony.</p>
          <div className="row">
            <button type="button" className="primary" onClick={() => dispatch({ type: "ensureCountry", code, status: "visited" })}>
              ✓ Odwiedzone
            </button>
            <button type="button" className="secondary" onClick={() => dispatch({ type: "ensureCountry", code, status: "wish" })}>
              ★ Chcę odwiedzić
            </button>
          </div>
        </div>
      ) : (
        <>
          <StatusSwitch value={entry.status} onChange={(status) => update({ status })} />

          {entry.status === "visited" && (
            <div className="field">
              <div className="field-head">
                <span className="field-label">Kolor na mapie</span>
                <button type="button" className="link-button" onClick={() => update({ color: randomColor() })}>
                  🎲 Losuj
                </button>
              </div>
              <div className="swatches">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={c === entry.color ? "swatch active" : "swatch"}
                    style={{ background: c }}
                    onClick={() => update({ color: c })}
                    aria-label={`Kolor ${c}`}
                  />
                ))}
              </div>
            </div>
          )}

          <DateField
            key={`d-${code}`}
            label={entry.status === "visited" ? "Kiedy byłeś" : "Planowany termin"}
            value={entry.date}
            onChange={(date) => update({ date })}
          />

          <NoteField value={entry.note} onChange={(note) => update({ note })} />

          {hasRegions(code) && (
            <RegionPicker
              code={code}
              color={entry.color}
              selected={entry.regions ?? []}
              onToggle={(regionId) => dispatch({ type: "toggleRegion", code, regionId })}
            />
          )}
        </>
      )}

      <div className="field">
        <span className="field-label">Miasta {places.length > 0 && `(${places.length})`}</span>
        {places.length === 0 ? (
          <p className="muted">Dodaj miasto przez wyszukiwarkę, pojawi się jako pinezka.</p>
        ) : (
          <ul className="item-list">
            {places.map((p) => (
              <li key={p.id}>
                <button type="button" className="item" onClick={() => onOpenPlace(p.id)}>
                  <span className={`dot ${p.status}`} style={p.status === "visited" ? { background: entry?.color } : undefined} />
                  <span className="item-name">{p.name}</span>
                  <span className="item-meta">
                    {[formatDate(p.date), p.photos.length ? `${p.photos.length} zdj.` : ""].filter(Boolean).join(" · ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {entry && (
        <button
          type="button"
          className="danger"
          onClick={() => {
            dispatch({ type: "removeCountry", code });
            onBack();
          }}
        >
          Usuń kraj
        </button>
      )}
    </div>
  );
}
