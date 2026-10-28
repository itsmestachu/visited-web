type Props = {
  label: string;
  value: number;
  max: number;
  caption: string;
};

export function BarRow({ label, value, max, caption }: Props) {
  return (
    <div className="bar-row">
      <span className="bar-row-label">{label}</span>
      <div className="bar-row-track">
        <div style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="bar-row-caption">{caption}</span>
    </div>
  );
}
