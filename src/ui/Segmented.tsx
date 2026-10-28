import "./Segmented.css";

type Option<T extends string> = { value: T; label: string; tone?: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "normal" | "small";
  className?: string;
};

export function Segmented<T extends string>({ options, value, onChange, size = "normal", className }: Props<T>) {
  return (
    <div className={["segmented", size === "small" ? "small" : "", className ?? ""].filter(Boolean).join(" ")}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={o.value === value ? ["active", o.tone].filter(Boolean).join(" ") : undefined}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
