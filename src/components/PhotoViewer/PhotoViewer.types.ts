export const SKETCH_COVER = "sketch";

export type PhotoViewerProps = {
  title: string;
  subtitle?: string;
  photoIds: string[];
  startIndex: number;
  autoplay: boolean;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
  // Card cover choice: a photo id, or SKETCH_COVER for the drawn map.
  cover?: { value: string | undefined; onChange: (value: string) => void };
};
