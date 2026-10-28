import type { Status } from "./store";

type Props = {
  value: Status;
  onChange: (status: Status) => void;
};

export function StatusSwitch({ value, onChange }: Props) {
  return (
    <div className="segmented">
      <button type="button" className={value === "visited" ? "active visited" : undefined} onClick={() => onChange("visited")}>
        ✓ Odwiedzone
      </button>
      <button type="button" className={value === "wish" ? "active wish" : undefined} onClick={() => onChange("wish")}>
        ★ Chcę odwiedzić
      </button>
    </div>
  );
}
