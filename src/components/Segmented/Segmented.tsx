import { Option, Track } from "./Segmented.styles";
import type { SegmentedProps } from "./Segmented.types";

export function Segmented<T extends string>({ options, value, onChange, size = "normal", className }: SegmentedProps<T>) {
  const small = size === "small";
  return (
    <Track className={className} $small={small} role="radiogroup">
      {options.map((o) => (
        <Option
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          $active={o.value === value}
          $tone={o.tone}
          $small={small}
          disabled={o.disabled}
          title={o.hint}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Option>
      ))}
    </Track>
  );
}
