import { useRef } from "react";
import { countryName } from "../../data/countries";
import { formatDate } from "../../utils/dates";
import { STATUS_LABEL } from "../../store/store.labels";
import { PhotoThumb } from "../PhotoThumb/PhotoThumb";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { CARD_WIDTH, useCardPosition, useEscapeKey } from "./PlaceCard.hooks";
import { Actions, Card, Chip, Close, DateLine, Details, Empty, Head, Meta, Note, Photos, Title } from "./PlaceCard.styles";
import type { PlaceCardProps } from "./PlaceCard.types";

const MAX_THUMBS = 6;

export function PlaceCard({
  place,
  x,
  y,
  area,
  onAddPhotos,
  uploading,
  onOpenPhoto,
  onDeletePhoto,
  onDelete,
  onClose,
}: PlaceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { left, top } = useCardPosition(cardRef, x, y, area);
  useEscapeKey(onClose);
  const visited = place.status === "visited";
  const shown = place.photos.slice(0, MAX_THUMBS);
  const rest = place.photos.length - shown.length;
  const pickFiles = () => inputRef.current?.click();

  return (
    <Card ref={cardRef} style={{ left, top, width: CARD_WIDTH }}>
      <Head>
        <div>
          <Title>{place.name}</Title>
          <Meta>
            <Chip $status={place.status}>{STATUS_LABEL[place.status]}</Chip>
            {countryName(place.countryCode)}
          </Meta>
        </div>
        <Close type="button" onClick={onClose} aria-label="Zamknij">
          <Icon name="close" size={16} />
        </Close>
      </Head>

      {(place.date || place.note) && (
        <Details>
          {place.date && (
            <DateLine>
              <span>{visited ? "Byłeś:" : "Planujesz:"}</span>
              <span>{formatDate(place.date)}</span>
            </DateLine>
          )}
          {place.note && <Note>{place.note}</Note>}
        </Details>
      )}

      {visited &&
        (place.photos.length === 0 ? (
          <Empty type="button" onClick={pickFiles} disabled={uploading !== null}>
            <span>+</span>
            {uploading ? `Wczytywanie ${uploading.done}/${uploading.total}` : "Dodaj zdjęcia z tego miejsca"}
          </Empty>
        ) : (
          <Photos>
            {shown.map((id, i) => (
              <PhotoThumb
                key={id}
                id={id}
                onOpen={() => onOpenPhoto(i, false)}
                onDelete={() => onDeletePhoto(id)}
                overlay={i === shown.length - 1 && rest > 0 ? `+${rest}` : undefined}
              />
            ))}
          </Photos>
        ))}

      <Actions>
        {visited && place.photos.length > 1 ? (
          <Button variant="primary" onClick={() => onOpenPhoto(0, true)}>
            ▶ Pokaz zdjęć
          </Button>
        ) : (
          <span />
        )}
        {visited && place.photos.length > 0 && (
          <Button variant="icon" onClick={pickFiles} disabled={uploading !== null} aria-label="Dodaj zdjęcia" title="Dodaj zdjęcia">
            <Icon name="camera" />
          </Button>
        )}
        <Button variant="icon" danger onClick={onDelete} aria-label={`Usuń ${place.name}`} title="Usuń miejsce">
          <Icon name="trash" />
        </Button>
      </Actions>

      {visited && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            onAddPhotos(e.target.files);
            e.target.value = "";
          }}
        />
      )}
    </Card>
  );
}
