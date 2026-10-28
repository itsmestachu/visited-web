import { useRef, useState } from "react";
import type { Dispatch, Place } from "./store";
import { countryName } from "./countries";
import { DateField } from "./DateField";
import { formatDate } from "./dates";
import { NoteField } from "./NoteField";
import { StatusSwitch } from "./StatusSwitch";
import { PhotoViewer } from "./PhotoViewer";
import { deletePhoto, forgetPhotoUrls, savePhoto, usePhotoUrl } from "./photos";

type Props = {
  place: Place;
  dispatch: Dispatch;
  onBack: () => void;
  onOpenCountry: (code: string) => void;
  onFocus: () => void;
};

function Thumb({ id, onClick }: { id: string; onClick: () => void }) {
  const url = usePhotoUrl(id, "thumb");
  return (
    <button type="button" className="thumb" onClick={onClick}>
      {url ? <img src={url} alt="" loading="lazy" /> : <span className="thumb-loading" />}
    </button>
  );
}

export function PlaceDetail({ place, dispatch, onBack, onOpenCountry, onFocus }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [viewer, setViewer] = useState<{ index: number; autoplay: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    setError(null);
    setUploading({ done: 0, total: list.length });
    const ids: string[] = [];
    let failed = 0;
    for (const file of list) {
      try {
        ids.push(await savePhoto(file));
      } catch {
        failed++;
      }
      setUploading({ done: ids.length + failed, total: list.length });
    }
    if (ids.length) dispatch({ type: "addPhotos", id: place.id, photoIds: ids });
    if (failed) setError(`Nie udało się wczytać ${failed} zdj.`);
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = async (photoId: string) => {
    dispatch({ type: "removePhoto", id: place.id, photoId });
    forgetPhotoUrls(photoId);
    await deletePhoto(photoId);
  };

  const removePlace = async () => {
    const msg = place.photos.length
      ? `Usunąć ${place.name} razem z ${place.photos.length} zdjęciami?`
      : `Usunąć ${place.name}?`;
    if (!confirm(msg)) return;
    dispatch({ type: "removePlace", id: place.id });
    onBack();
    for (const id of place.photos) {
      forgetPhotoUrls(id);
      await deletePhoto(id);
    }
  };

  return (
    <div className="detail">
      <button type="button" className="back" onClick={onBack}>
        ← Wróć
      </button>
      <div className="detail-head">
        <div>
          <h2>{place.name}</h2>
          <button type="button" className="link-button" onClick={() => onOpenCountry(place.countryCode)}>
            {countryName(place.countryCode)}
          </button>
        </div>
        <button type="button" className="icon-button" onClick={onFocus} aria-label="Pokaż na mapie">
          ⌖
        </button>
      </div>

      <StatusSwitch value={place.status} onChange={(status) => dispatch({ type: "updatePlace", id: place.id, patch: { status } })} />

      <DateField
        key={`d-${place.id}`}
        label={place.status === "visited" ? "Kiedy byłeś" : "Planowany termin"}
        value={place.date}
        onChange={(date) => dispatch({ type: "updatePlace", id: place.id, patch: { date } })}
      />

      <NoteField
        key={`n-${place.id}`}
        value={place.note}
        onChange={(note) => dispatch({ type: "updatePlace", id: place.id, patch: { note } })}
      />

      <div className="field">
        <div className="field-head">
          <span className="field-label">Zdjęcia {place.photos.length > 0 && `(${place.photos.length})`}</span>
          {place.photos.length > 1 && (
            <button type="button" className="link-button" onClick={() => setViewer({ index: 0, autoplay: true })}>
              ▶ Odtwórz wspomnienia
            </button>
          )}
        </div>
        <div className="thumbs">
          {place.photos.map((id, i) => (
            <Thumb key={id} id={id} onClick={() => setViewer({ index: i, autoplay: false })} />
          ))}
          <button
            type="button"
            className="thumb add"
            onClick={() => fileRef.current?.click()}
            disabled={uploading !== null}
          >
            {uploading ? `${uploading.done}/${uploading.total}` : "+"}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />
        {error && <p className="error">{error}</p>}
      </div>

      <button type="button" className="danger" onClick={removePlace}>
        Usuń miejsce
      </button>

      {viewer && (
        <PhotoViewer
          title={place.name}
          subtitle={[countryName(place.countryCode), formatDate(place.date)].filter(Boolean).join(" · ")}
          photoIds={place.photos}
          startIndex={viewer.index}
          autoplay={viewer.autoplay}
          onClose={() => setViewer(null)}
          onDelete={removePhoto}
        />
      )}
    </div>
  );
}
