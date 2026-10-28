import type { Status } from "../../types/models";
import { StatusSwitch } from "../form/StatusSwitch";
import "./ModeSwitch.css";

export function ModeSwitch({ mode, onChange }: { mode: Status; onChange: (mode: Status) => void }) {
  return <StatusSwitch value={mode} onChange={onChange} className="mode-switch" />;
}
