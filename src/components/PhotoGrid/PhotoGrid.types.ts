import type { UploadProgress } from "../../services/photoStorage/photoStorage.hooks";

export type PhotoGridProps = {
  photoIds: string[];
  uploading: UploadProgress | null;
  onOpen: (index: number) => void;
  onDelete: (photoId: string) => void;
  onAdd: (files: FileList | null) => void;
};
