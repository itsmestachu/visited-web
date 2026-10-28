import { useMemo, useState, type KeyboardEvent } from "react";
import { searchCities, type CityIndex } from "../../data/cities";
import { countryName } from "../../data/countries";
import type { City, UnescoSite } from "../../data/data.types";
import type { UnescoIndex } from "../../data/unesco";
import { Icon } from "../../components/Icon/Icon";
import { Empty, Input, InputWrap, Kind, Main, ResultItem, Results, SearchIcon, Sub, Wrapper } from "../../components/SearchBar/SearchBar.styles";
import { normalize } from "../../utils/text";

type Result = { kind: "city"; city: City } | { kind: "site"; site: UnescoSite };

type Props = {
  cities: CityIndex | null;
  unesco: UnescoIndex | null;
  placeholder: string;
  onPick: (result: Result) => void;
};

export type StopResult = Result;

const SITE_LIMIT = 4;

export function StopSearch({ cities, unesco, placeholder, onPick }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const siteKeys = useMemo(() => unesco?.list.map((s) => normalize(s.name)) ?? [], [unesco]);

  const results = useMemo<Result[]>(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return [];
    const found: Result[] = cities ? searchCities(cities, query, 6).map((city) => ({ kind: "city", city })) : [];
    if (unesco && q.length >= 3) {
      for (let i = 0; i < unesco.list.length && found.length < 6 + SITE_LIMIT; i++) {
        if (siteKeys[i].includes(q)) found.push({ kind: "site", site: unesco.list[i] });
      }
    }
    return found;
  }, [query, cities, unesco, siteKeys]);

  const pick = (r: Result) => {
    onPick(r);
    setQuery("");
    setActive(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
    <Wrapper>
      <InputWrap>
        <SearchIcon>
          <Icon name="search" size={17} />
        </SearchIcon>
        <Input
          type="search"
          placeholder={placeholder}
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
          aria-controls="stop-search-results"
          autoComplete="off"
        />
      </InputWrap>
      {open && query.trim().length >= 2 && (
        <Results id="stop-search-results" role="listbox">
          {results.length === 0 && <Empty>{cities ? "Brak wyników" : "Wczytywanie miast…"}</Empty>}
          {results.map((r, i) => (
            <ResultItem
              key={r.kind === "city" ? `c-${r.city.id}` : `s-${r.site.id}`}
              role="option"
              aria-selected={i === active}
              $active={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(r);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <Kind aria-hidden="true">{r.kind === "city" ? "●" : "◆"}</Kind>
              <Main>
                <span>{r.kind === "city" ? r.city.namePl : r.site.name}</span>
                <Sub>
                  {r.kind === "city"
                    ? countryName(r.city.countryCode)
                    : `UNESCO · ${r.site.countryCodes.map(countryName).join(", ")}`}
                </Sub>
              </Main>
            </ResultItem>
          ))}
        </Results>
      )}
    </Wrapper>
  );
}
