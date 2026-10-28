import { DeleteButton, Main, Meta, Row, Sub, Texts, Title } from "./ListRow.styles";
import type { ListRowProps } from "./ListRow.types";

export { List } from "./ListRow.styles";

export function ListRow({ marker, title, subtitle, meta, onClick, onDelete, deleteLabel }: ListRowProps) {
  return (
    <Row>
      <Main type="button" onClick={onClick}>
        {marker}
        <Texts>
          <Title>{title}</Title>
          {subtitle && <Sub>{subtitle}</Sub>}
        </Texts>
        {meta && <Meta>{meta}</Meta>}
      </Main>
      {onDelete && (
        <DeleteButton type="button" onClick={onDelete} aria-label={deleteLabel ?? `Usuń ${title}`} title="Usuń">
          ✕
        </DeleteButton>
      )}
    </Row>
  );
}
