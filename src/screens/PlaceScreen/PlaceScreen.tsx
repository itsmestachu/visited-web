import type { Place } from "../../store/store.types";
import { countryName } from "../../data/countries";
import { Button } from "../../components/Button/Button";
import { Field } from "../../components/Field/Field";
import { DateField } from "../../components/DateField/DateField";
import { NoteField } from "../../components/NoteField/NoteField";
import { StatusSwitch } from "../../components/StatusSwitch/StatusSwitch";
import { PhotoGrid } from "../../components/PhotoGrid/PhotoGrid";
import { ScreenHeader } from "../../components/ScreenHeader/ScreenHeader";
import { ErrorText, ScreenLayout } from "../../components/ScreenLayout/ScreenLayout";
import type { PlaceScreenProps } from "./PlaceScreen.types";

export function PlaceScreen({
  place,
  dispatch,
  uploading,
  uploadError,
  onUpload,
  onBack,
  onFocus,
  onOpenCountry,
  onOpenPhotos,
  onDeletePhoto,
  onRemove,
}: PlaceScreenProps) {
  const update = (patch: Partial<Place>) => dispatch({ type: "updatePlace", id: place.id, patch });

  return (
    <ScreenLayout>
      <ScreenHeader
        title={place.name}
        subtitle={countryName(place.countryCode)}
        onSubtitleClick={() => onOpenCountry(place.countryCode)}
        onBack={onBack}
        onFocus={onFocus}
        onDelete={onRemove}
        deleteLabel={`Usuń ${place.name}`}
      />

      <StatusSwitch
        value={place.status}
        onChange={(status) => update({ status })}
        wishDisabledReason={place.photos.length > 0 ? "Usuń zdjęcia, aby przenieść miejsce na listę marzeń" : undefined}
      />

      {place.status === "visited" && (
        <Field
          label={`Zdjęcia${place.photos.length ? ` · ${place.photos.length}` : ""}`}
          action={
            place.photos.length > 1 && (
              <Button variant="link" onClick={() => onOpenPhotos(0, true)}>
                ▶ Odtwórz wspomnienia
              </Button>
            )
          }
        >
          <PhotoGrid
            photoIds={place.photos}
            uploading={uploading}
            onOpen={(i) => onOpenPhotos(i, false)}
            onDelete={onDeletePhoto}
            onAdd={onUpload}
          />
          {uploadError && <ErrorText>{uploadError}</ErrorText>}
        </Field>
      )}

      <DateField
        key={`date-${place.id}`}
        label={place.status === "visited" ? "Kiedy byłeś" : "Planowany termin"}
        value={place.date}
        onChange={(date) => update({ date })}
      />

      <NoteField value={place.note} onChange={(note) => update({ note })} />
    </ScreenLayout>
  );
}
