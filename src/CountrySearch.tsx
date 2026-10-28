import { useMemo, useState } from "react";
import { searchCountries, type Country } from "./countries";

type Props = {
  selected: Set<string>;
  onPick: (country: Country) => void;
};

export function CountrySearch({ selected, onPick }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchCountries(query), [query]);

  const pick = (country: Country) => {
    onPick(country);
    setQuery("");
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div className="search">
      <input
        type="search"
        placeholder="Szukaj kraju…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="search-results"
        autoComplete="off"
      />
      {open && query.trim() !== "" && (
        <ul id="search-results" className="search-results" role="listbox">
          {results.length === 0 && <li className="search-empty">Brak wyników</li>}
          {results.map((c, i) => (
            <li
              key={c.code}
              role="option"
              aria-selected={i === active}
              className={i === active ? "active" : undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(c);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span>{c.name}</span>
              {selected.has(c.code) ? (
                <span className="search-tag visited">✓ odwiedzony</span>
              ) : (
                <span className="search-tag">{c.nameEn !== c.name ? c.nameEn : c.code}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
