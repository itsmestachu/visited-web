import { useRef } from "react";
import { PhotoThumb } from "./PhotoThumb";
import "./PhotoGrid.css";

type Props = {
  photoIds: string[];
  uploading: { done: number; total: number } | null;
  onOpen: (index: number) => void;
  onAdd: (files: FileList | null) => void;
};

export function PhotoGrid({ photoIds, uploading, onOpen, onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="photo-grid">
      {photoIds.map((id, i) => (
        <PhotoThumb key={id} id={id} onClick={() => onOpen(i)} />
      ))}
      <button
        type="button"
        className="photo-grid-add"
        onClick={() => inputRef.current?.click()}
        disabled={uploading !== null}
        aria-label="Dodaj zdjęcia"
      >
        {uploading ? `${uploading.done}/${uploading.total}` : "+"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          onAdd(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
