export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  tone?: "red" | "wish";
  disabled?: boolean;
  hint?: string;
};

export type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "normal" | "small";
  className?: string;
};
