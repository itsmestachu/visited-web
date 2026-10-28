import "./ZoomControls.css";

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function ZoomControls({ onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div className="zoom-controls">
      <button type="button" onClick={onZoomIn} aria-label="Przybliż">
        +
      </button>
      <button type="button" onClick={onZoomOut} aria-label="Oddal">
        −
      </button>
      <button type="button" onClick={onReset} aria-label="Cała mapa">
        ⤢
      </button>
    </div>
  );
}
