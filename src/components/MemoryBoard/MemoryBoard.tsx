import { useState } from "react";
import type { AppData } from "../../store/store.types";
import { usePhotoUrl } from "../../services/photoStorage/photoStorage.hooks";
import { useTravelStats } from "../../screens/StatsScreen/StatsScreen.hooks";
import { plural } from "../../utils/text";
import { PhotoViewer } from "../PhotoViewer/PhotoViewer";
import { tiltFor, useMemories, type Memory } from "./MemoryBoard.hooks";
import {
  Avatar,
  Bio,
  Caption,
  Card,
  Count,
  Empty,
  Grid,
  Kicker,
  Name,
  Picture,
  PlannedStamp,
  Polaroid,
  Stamp,
  StampFace,
  Stamps,
  Sub,
  Tape,
  Wall,
  Who,
} from "./MemoryBoard.styles";
import { TripSketch } from "./TripSketch";

type Props = {
  data: AppData;
  unescoTotal: number;
  onOpenTrip: (id: string) => void;
  onOpenPlace: (id: string) => void;
};

const STAMP_TONES = ["#f1c23f", "#e8b4a0", "#b9cdb5", "#e9dcbd", "#a9c1d6", "#f1e3bf"];

function Cover({ memory }: { memory: Memory }) {
  const url = usePhotoUrl(memory.photoIds[0] ?? "", "thumb");
  if (memory.photoIds.length === 0) return <TripSketch stops={memory.stops} />;
  return url ? <img src={url} alt="" loading="lazy" /> : null;
}

function ProfileAvatar({ avatarId, name }: { avatarId?: string; name: string }) {
  const url = usePhotoUrl(avatarId ?? "", "thumb");
  return <Avatar>{avatarId && url ? <img src={url} alt="" /> : <span aria-hidden="true">{name.trim()[0]?.toUpperCase() ?? "?"}</span>}</Avatar>;
}

export function MemoryBoard({ data, unescoTotal, onOpenTrip, onOpenPlace }: Props) {
  const memories = useMemories(data);
  const s = useTravelStats(data);
  const [viewing, setViewing] = useState<Memory | null>(null);
  const name = data.profile.name?.trim() || "Podróżnik";
  const doneTrips = Object.values(data.trips).filter((t) => t.status === "done").length;

  const stamps = [
    { value: `${s.visited}`, label: `${plural(s.visited, "kraj", "kraje", "krajów")} z ${s.total}` },
    { value: `${s.continentsVisited}`, label: plural(s.continentsVisited, "kontynent", "kontynenty", "kontynentów") },
    { value: `${s.cities}`, label: plural(s.cities, "miasto", "miasta", "miast") },
    { value: `${s.unescoVisited}`, label: `UNESCO z ${unescoTotal || "…"}` },
    { value: `${doneTrips}`, label: plural(doneTrips, "wyjazd", "wyjazdy", "wyjazdów") },
    { value: `${s.photos}`, label: plural(s.photos, "zdjęcie", "zdjęcia", "zdjęć") },
  ];

  const open = (m: Memory) => {
    if (m.photoIds.length > 0) setViewing(m);
    else if (m.open.kind === "trip") onOpenTrip(m.open.id);
    else onOpenPlace(m.open.id);
  };

  return (
    <Wall>
      <Card>
        <ProfileAvatar avatarId={data.profile.avatarId} name={name} />
        <Who>
          <Kicker>Tablica podróży</Kicker>
          <Name>{name}</Name>
          {data.profile.bio && <Bio>{data.profile.bio}</Bio>}
        </Who>
      </Card>

      <Stamps>
        {stamps.map((st, i) => (
          <Stamp key={st.label} $tone={STAMP_TONES[i % STAMP_TONES.length]}>
            <StampFace $tone={STAMP_TONES[i % STAMP_TONES.length]}>
              <strong>{st.value}</strong>
              <small>{st.label}</small>
            </StampFace>
          </Stamp>
        ))}
      </Stamps>

      {memories.length === 0 ? (
        <Empty>Tu zawisną Twoje wyjazdy. Dodaj zdjęcia do odwiedzonych miast albo zaplanuj wyjazd w planerze.</Empty>
      ) : (
        <Grid>
          {memories.map((m) => {
            const tilt = tiltFor(m.id);
            return (
              <Polaroid key={m.id} type="button" $tilt={tilt} onClick={() => open(m)} aria-label={`${m.title}: ${m.photoIds.length ? "zobacz zdjęcia" : "otwórz"}`}>
                <Tape $tilt={tilt} aria-hidden="true" />
                <Picture>
                  <Cover memory={m} />
                  {m.photoIds.length > 1 && <Count>{m.photoIds.length} zdj.</Count>}
                  {m.planned && <PlannedStamp>W planach</PlannedStamp>}
                </Picture>
                <Caption>{m.title}</Caption>
                {m.subtitle && <Sub>{m.subtitle}</Sub>}
              </Polaroid>
            );
          })}
        </Grid>
      )}

      {viewing && (
        <PhotoViewer
          title={viewing.title}
          subtitle={viewing.subtitle}
          photoIds={viewing.photoIds}
          startIndex={0}
          autoplay={false}
          onClose={() => setViewing(null)}
        />
      )}
    </Wall>
  );
}
