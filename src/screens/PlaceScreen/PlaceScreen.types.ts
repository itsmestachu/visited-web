import type { Dispatch, Place } from "../../store/store.types";
import type { UploadProgress } from "../../services/photoStorage/photoStorage.hooks";

export type PlaceScreenProps = {
  place: Place;
  dispatch: Dispatch;
  uploading: UploadProgress | null;
  uploadError: string | null;
  onUpload: (files: FileList | null) => void;
  onBack: () => void;
  onFocus: () => void;
  onOpenCountry: (code: string) => void;
  onOpenPhotos: (index: number, autoplay: boolean) => void;
  onDeletePhoto: (photoId: string) => void;
  onRemove: () => void;
};
