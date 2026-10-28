import type { Status } from "../../types/models";
import { MODE_LABEL, STATUS_ICON } from "../../constants/labels";
import { Segmented } from "../../ui/Segmented";

const OPTIONS = (["visited", "wish"] as const).map((s) => ({
  value: s,
  label: `${STATUS_ICON[s]} ${MODE_LABEL[s]}`,
  tone: s,
}));

type Props = {
  value: Status;
  onChange: (status: Status) => void;
  className?: string;
};

export function StatusSwitch({ value, onChange, className }: Props) {
  return <Segmented options={OPTIONS} value={value} onChange={onChange} className={className} />;
}
