import { countryName } from "../../data/countries";
import { STATUS_ICON } from "../../store/store.labels";
import { Kind, Main, ResultItem, Sub, Tag } from "./SearchBar.styles";
import type { SearchResultRowProps } from "./SearchBar.types";

export function SearchResultRow({ result, status, active, onPick, onHover }: SearchResultRowProps) {
  const name = result.kind === "country" ? result.country.name : result.city.namePl;
  const sub =
    result.kind === "country"
      ? "Kraj"
      : [result.city.namePl !== result.city.name ? result.city.name : "", countryName(result.city.countryCode)]
          .filter(Boolean)
          .join(" · ");
  return (
    <ResultItem
      role="option"
      aria-selected={active}
      $active={active}
      onMouseDown={(e) => {
        e.preventDefault();
        onPick();
      }}
      onMouseEnter={onHover}
    >
      <Kind aria-hidden="true">{result.kind === "country" ? "◼" : "●"}</Kind>
      <Main>
        <span>{name}</span>
        <Sub>{sub}</Sub>
      </Main>
      {status && (
        <Tag $tone={status === "visited" ? "red" : "wish"}>
          {STATUS_ICON[status]} {status === "visited" ? "byłeś" : "na liście"}
        </Tag>
      )}
    </ResultItem>
  );
}
