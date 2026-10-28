import "./ProgressBar.css";

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress-bar" aria-hidden="true">
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}
