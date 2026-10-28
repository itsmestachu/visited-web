import type { UnescoSite } from "../../data/data.types";
import { CATEGORY_LABEL } from "../../data/unesco";
import { MODE_LABEL, STATUS_ICON } from "../../store/store.labels";
import type { SiteEntry, Status } from "../../store/store.types";
import { Meta, Name, Row, Rows, Texts, Toggle, Toggles } from "./SiteList.styles";

type Props = {
  sites: UnescoSite[];
  collected: Record<string, SiteEntry>;
  onSet: (site: UnescoSite, status: Status | null) => void;
};

const STATUSES: Status[] = ["visited", "wish"];

export function SiteList({ sites, collected, onSet }: Props) {
  return (
    <Rows>
      {sites.map((site) => {
        const current = collected[site.id]?.status;
        return (
          <Row key={site.id}>
            <Texts>
              <Name>{site.name}</Name>
              <Meta>{[site.year, CATEGORY_LABEL[site.category], site.danger ? "zagrożone" : ""].filter(Boolean).join(" · ")}</Meta>
            </Texts>
            <Toggles>
              {STATUSES.map((status) => (
                <Toggle
                  key={status}
                  type="button"
                  $tone={status}
                  $on={current === status}
                  aria-pressed={current === status}
                  aria-label={`${MODE_LABEL[status]}: ${site.name}`}
                  title={MODE_LABEL[status]}
                  onClick={() => onSet(site, current === status ? null : status)}
                >
                  {STATUS_ICON[status]}
                </Toggle>
              ))}
            </Toggles>
          </Row>
        );
      })}
    </Rows>
  );
}
