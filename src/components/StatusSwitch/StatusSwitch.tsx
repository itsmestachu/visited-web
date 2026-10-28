import type { Status } from "../../store/store.types";
import { MODE_LABEL, STATUS_ICON } from "../../store/store.labels";
import { Segmented } from "../Segmented/Segmented";
import type { SegmentedOption } from "../Segmented/Segmented.types";

type Props = {
  value: Status;
  onChange: (status: Status) => void;
  className?: string;
  wishDisabledReason?: string;
};

export function StatusSwitch({ value, onChange, className, wishDisabledReason }: Props) {
  const options: SegmentedOption<Status>[] = [
    { value: "visited", label: `${STATUS_ICON.visited} ${MODE_LABEL.visited}`, tone: "red" },
    {
      value: "wish",
      label: `${STATUS_ICON.wish} ${MODE_LABEL.wish}`,
      tone: "wish",
      disabled: wishDisabledReason !== undefined,
      hint: wishDisabledReason,
    },
  ];
  return <Segmented options={options} value={value} onChange={onChange} className={className} />;
}
