import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { Row, Subtitle, Title, Tools, Wrapper } from "./ScreenHeader.styles";
import type { ScreenHeaderProps } from "./ScreenHeader.types";

export function ScreenHeader({ title, subtitle, onSubtitleClick, onBack, onFocus, onDelete, deleteLabel }: ScreenHeaderProps) {
  return (
    <Wrapper>
      <Button variant="back" onClick={onBack}>
        ← Wróć do listy
      </Button>
      <Row>
        <div>
          <Title>{title}</Title>
          {subtitle && (
            <Subtitle>
              {onSubtitleClick ? (
                <Button variant="link" onClick={onSubtitleClick}>
                  {subtitle}
                </Button>
              ) : (
                subtitle
              )}
            </Subtitle>
          )}
        </div>
        <Tools>
          <Button variant="icon" onClick={onFocus} aria-label="Pokaż na mapie" title="Pokaż na mapie">
            <Icon name="target" />
          </Button>
          {onDelete && (
            <Button variant="icon" danger onClick={onDelete} aria-label={deleteLabel} title={deleteLabel}>
              <Icon name="trash" />
            </Button>
          )}
        </Tools>
      </Row>
    </Wrapper>
  );
}
