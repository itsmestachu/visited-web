export type PhotoViewerProps = {
  title: string;
  subtitle?: string;
  photoIds: string[];
  startIndex: number;
  autoplay: boolean;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
};
