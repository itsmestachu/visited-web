export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onSubtitleClick?: () => void;
  onBack: () => void;
  onFocus: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
};
