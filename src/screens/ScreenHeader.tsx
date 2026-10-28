import { Button } from "../ui/Button";
import "./ScreenHeader.css";

type Props = {
  title: string;
  subtitle?: string;
  onSubtitleClick?: () => void;
  onBack: () => void;
  onFocus: () => void;
};

export function ScreenHeader({ title, subtitle, onSubtitleClick, onBack, onFocus }: Props) {
  return (
    <>
      <Button variant="back" onClick={onBack}>
        ← Wróć
      </Button>
      <div className="screen-header">
        <div>
          <h2>{title}</h2>
          {subtitle &&
            (onSubtitleClick ? (
              <Button variant="link" onClick={onSubtitleClick}>
                {subtitle}
              </Button>
            ) : (
              <span className="muted">{subtitle}</span>
            ))}
        </div>
        <Button variant="icon" onClick={onFocus} aria-label="Pokaż na mapie">
          ⌖
        </Button>
      </div>
    </>
  );
}
