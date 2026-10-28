import type { Status } from "../../store/store.types";
import { FloatingSwitch } from "./ModeSwitch.styles";

type Props = {
  mode: Status;
  onChange: (mode: Status) => void;
};

export function ModeSwitch({ mode, onChange }: Props) {
  return <FloatingSwitch value={mode} onChange={onChange} />;
}
