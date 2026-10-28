import type { Status } from "../../types/models";
import { countryName } from "../../data/countries";
import { STATUS_ICON } from "../../constants/labels";
import type { SearchResult } from "./useSearchResults";

type Props = {
  result: SearchResult;
  status: Status | undefined;
  active: boolean;
  onPick: () => void;
  onHover: () => void;
};

const STATUS_TAG: Record<Status, string> = { visited: `${STATUS_ICON.visited} odwiedzone`, wish: `${STATUS_ICON.wish} na liście` };

export function SearchResultRow({ result, status, active, onPick, onHover }: Props) {
  const name = result.kind === "country" ? result.country.name : result.city.namePl;
  const sub =
    result.kind === "country"
      ? "Kraj"
      : [result.city.namePl !== result.city.name ? result.city.name : "", countryName(result.city.countryCode)]
          .filter(Boolean)
          .join(" · ");
  return (
    <li
      role="option"
      aria-selected={active}
      className={active ? "active" : undefined}
      onMouseDown={(e) => {
        e.preventDefault();
        onPick();
      }}
      onMouseEnter={onHover}
    >
      <span className="search-icon" aria-hidden="true">
        {result.kind === "country" ? "◼" : "●"}
      </span>
      <span className="search-main">
        <span className="search-name">{name}</span>
        <span className="search-sub">{sub}</span>
      </span>
      {status && <span className={`search-tag ${status}`}>{STATUS_TAG[status]}</span>}
    </li>
  );
}
