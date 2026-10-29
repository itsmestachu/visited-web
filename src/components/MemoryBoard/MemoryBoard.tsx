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
  Section,
  SectionLabel,
  Stamps,
  Sub,
  Tape,
  Wall,
  Who,
} from "./MemoryBoard.styles";
import { PostageStamp } from "./PostageStamp";
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

  const stamps = [
    { value: `${s.visited}`, label: `${plural(s.visited, "kraj", "kraje", "krajów")} z ${s.total}` },
    { value: `${s.continentsVisited}`, label: plural(s.continentsVisited, "kontynent", "kontynenty", "kontynentów") },
    { value: `${s.cities}`, label: plural(s.cities, "miasto", "miasta", "miast") },
    { value: `${s.unescoVisited}`, label: `UNESCO z ${unescoTotal || "…"}` },
    { value: `${memories.trips.length}`, label: plural(memories.trips.length, "wyjazd", "wyjazdy", "wyjazdów") },
    { value: `${s.photos}`, label: plural(s.photos, "zdjęcie", "zdjęcia", "zdjęć") },
  ];

  const sections = [
    { title: "W planach", items: memories.planned },
    { title: "Wyjazdy", items: memories.trips },
    { title: "Odwiedzone miejsca", items: memories.places },
  ].filter((section) => section.items.length > 0);

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
          <PostageStamp key={st.label} value={st.value} label={st.label} tone={STAMP_TONES[i % STAMP_TONES.length]} tilt={tiltFor(st.label) / 2} />
        ))}
      </Stamps>

      {sections.length === 0 && (
        <Empty>Tu zawisną Twoje wyjazdy i odwiedzone miejsca. Zaznacz miasta na mapie albo zaplanuj wyjazd w planerze.</Empty>
      )}
      {sections.map((section) => (
        <Section key={section.title}>
          <SectionLabel>
            {section.title}
            <small>{section.items.length}</small>
          </SectionLabel>
          <Grid>
            {section.items.map((m) => {
              const tilt = tiltFor(m.id);
              return (
                <Polaroid
                  key={m.id}
                  type="button"
                  $tilt={tilt}
                  onClick={() => open(m)}
                  aria-label={`${m.title}: ${m.photoIds.length ? "zobacz zdjęcia" : "otwórz"}`}
                >
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
        </Section>
      ))}

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
