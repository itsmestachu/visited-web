import { useCityStatuses, useSearch } from "./SearchBar.hooks";
import { Icon } from "../Icon/Icon";
import { Empty, Input, InputWrap, Results, SearchIcon, Wrapper } from "./SearchBar.styles";
import { SearchResultRow } from "./SearchResultRow";
import type { SearchBarProps } from "./SearchBar.types";

export function SearchBar({ data, cities, mode, onPickCountry, onPickCity }: SearchBarProps) {
  const cityStatus = useCityStatuses(data);
  const search = useSearch(cities, (r) => (r.kind === "country" ? onPickCountry(r.country) : onPickCity(r.city)));

  return (
    <Wrapper>
      <InputWrap>
        <SearchIcon>
          <Icon name="search" size={17} />
        </SearchIcon>
        <Input
          type="search"
          placeholder={mode === "visited" ? "Szukaj kraju lub miasta…" : "Szukaj miejsca na listę marzeń…"}
          value={search.query}
          onChange={(e) => search.changeQuery(e.target.value)}
          onFocus={() => search.setOpen(true)}
          onBlur={() => search.setOpen(false)}
          onKeyDown={search.onKeyDown}
          role="combobox"
          aria-expanded={search.open && search.results.length > 0}
          aria-controls="search-results"
          autoComplete="off"
        />
      </InputWrap>
      {search.open && search.query.trim() !== "" && (
        <Results id="search-results" role="listbox">
          {search.results.length === 0 && <Empty>{cities ? "Brak wyników" : "Wczytywanie miast…"}</Empty>}
          {search.results.map((r, i) => (
            <SearchResultRow
              key={r.kind === "country" ? `c-${r.country.code}` : `m-${r.city.id}`}
              result={r}
              status={r.kind === "country" ? data.countries[r.country.code]?.status : cityStatus.get(r.city.id)}
              active={i === search.active}
              onPick={() => search.pick(r)}
              onHover={() => search.setActive(i)}
            />
          ))}
        </Results>
      )}
    </Wrapper>
  );
}
