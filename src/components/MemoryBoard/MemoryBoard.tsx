import { useState } from "react";
import { useTheme } from "styled-components";
import type { AppData } from "../../store/store.types";
import { usePhotoUrl } from "../../services/photoStorage/photoStorage.hooks";
import { useTravelStats } from "../../screens/StatsScreen/StatsScreen.hooks";
import { plural } from "../../utils/text";
import { PhotoViewer } from "../PhotoViewer/PhotoViewer";
import { SKETCH_COVER } from "../PhotoViewer/PhotoViewer.types";
import { coverPhoto, tiltFor, useMemories, type Memory } from "./MemoryBoard.hooks";
import {
  Bio,
  Caption,
  Card,
  Count,
  Empty,
  Grid,
  Kicker,
  Mark,
  Marks,
  Name,
  Picture,
  PlannedStamp,
  Polaroid,
  Section,
  SectionLabel,
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
  onCover: (memory: Memory, cover: string) => void;
};

function Cover({ memory }: { memory: Memory }) {
  const photo = coverPhoto(memory);
  const url = usePhotoUrl(photo ?? "", "thumb");
  if (!photo) return <TripSketch stops={memory.stops} />;
  return url ? <img src={url} alt="" loading="lazy" /> : null;
}

export function MemoryBoard({ data, unescoTotal, onOpenTrip, onOpenPlace, onCover }: Props) {
  const memories = useMemories(data);
  const s = useTravelStats(data);
  const { colors } = useTheme();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const avatarUrl = usePhotoUrl(data.profile.avatarId ?? "", "thumb");
  const name = data.profile.name?.trim() || "Podróżnik";

  const marks = [
    { value: s.visited, label: plural(s.visited, "kraj", "kraje", "krajów") },
    { value: s.continentsVisited, label: plural(s.continentsVisited, "kontynent", "kontynenty", "kontynentów") },
    { value: s.cities, label: plural(s.cities, "miasto", "miasta", "miast") },
    { value: s.unescoVisited, label: `UNESCO${unescoTotal ? ` / ${unescoTotal}` : ""}` },
    { value: memories.trips.length, label: plural(memories.trips.length, "wyjazd", "wyjazdy", "wyjazdów") },
    { value: s.photos, label: plural(s.photos, "zdjęcie", "zdjęcia", "zdjęć") },
  ];

  const sections = [
    { title: "W planach", items: memories.planned },
    { title: "Wyjazdy", items: memories.trips },
    { title: "Odwiedzone miejsca", items: memories.places },
  ].filter((section) => section.items.length > 0);

  // Looked up on every render so the viewer reflects a cover change straight away.
  const viewing = sections.flatMap((section) => section.items).find((m) => m.id === viewingId);

  const open = (m: Memory) => {
    if (m.photoIds.length > 0) setViewingId(m.id);
    else if (m.open.kind === "trip") onOpenTrip(m.open.id);
    else onOpenPlace(m.open.id);
  };

  return (
    <Wall>
      <Card>
        <Who>
          <Kicker>Tablica podróży</Kicker>
          <Name>{name}</Name>
          {data.profile.bio && <Bio>{data.profile.bio}</Bio>}
          <Marks>
            {marks.map((m, i) => (
              <Mark key={m.label} $tone={i % 2 ? colors.wish : colors.red} $tilt={tiltFor(m.label) / 2}>
                <strong>{m.value}</strong>
                {m.label}
              </Mark>
            ))}
          </Marks>
        </Who>
        <PostageStamp imageUrl={data.profile.avatarId ? avatarUrl : null} initial={name[0].toUpperCase()} />
      </Card>

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
          onClose={() => setViewingId(null)}
          cover={{ value: coverPhoto(viewing) ?? SKETCH_COVER, onChange: (value) => onCover(viewing, value) }}
        />
      )}
    </Wall>
  );
}
