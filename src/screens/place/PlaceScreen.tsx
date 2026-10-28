import type { Place } from "../../types/models";
import type { Dispatch } from "../../store/actions";
import { countryName } from "../../data/countries";
import { usePhotoUpload } from "../../hooks/usePhotoUpload";
import { Button } from "../../ui/Button";
import { Field } from "../../ui/Field";
import { DateField } from "../../components/form/DateField";
import { NoteField } from "../../components/form/NoteField";
import { StatusSwitch } from "../../components/form/StatusSwitch";
import { PhotoGrid } from "../../components/photos/PhotoGrid";
import { ScreenHeader } from "../ScreenHeader";

type Props = {
  place: Place;
  dispatch: Dispatch;
  onBack: () => void;
  onOpenCountry: (code: string) => void;
  onFocus: () => void;
  onOpenPhotos: (index: number, autoplay: boolean) => void;
  onRemove: () => void;
};

export function PlaceScreen({ place, dispatch, onBack, onOpenCountry, onFocus, onOpenPhotos, onRemove }: Props) {
  const { upload, progress, error } = usePhotoUpload((photoIds) => dispatch({ type: "addPhotos", id: place.id, photoIds }));
  const update = (patch: Partial<Place>) => dispatch({ type: "updatePlace", id: place.id, patch });

  const confirmRemove = () => {
    const msg = place.photos.length
      ? `Usunąć ${place.name} razem z ${place.photos.length} zdjęciami?`
      : `Usunąć ${place.name}?`;
    if (confirm(msg)) onRemove();
  };

  return (
    <div className="screen">
      <ScreenHeader
        title={place.name}
        subtitle={countryName(place.countryCode)}
        onSubtitleClick={() => onOpenCountry(place.countryCode)}
        onBack={onBack}
        onFocus={onFocus}
      />

      <StatusSwitch value={place.status} onChange={(status) => update({ status })} />

      <DateField
        key={`date-${place.id}`}
        label={place.status === "visited" ? "Kiedy byłeś" : "Planowany termin"}
        value={place.date}
        onChange={(date) => update({ date })}
      />

      <NoteField value={place.note} onChange={(note) => update({ note })} />

      <Field
        label={`Zdjęcia${place.photos.length ? ` (${place.photos.length})` : ""}`}
        action={
          place.photos.length > 1 && (
            <Button variant="link" onClick={() => onOpenPhotos(0, true)}>
              ▶ Odtwórz wspomnienia
            </Button>
          )
        }
      >
        <PhotoGrid photoIds={place.photos} uploading={progress} onOpen={(i) => onOpenPhotos(i, false)} onAdd={upload} />
        {error && <p className="error">{error}</p>}
      </Field>

      <Button variant="danger" onClick={confirmRemove}>
        Usuń miejsce
      </Button>
    </div>
  );
}
