import { useRef, useState } from "react";
import type { Profile } from "../../store/store.types";
import { usePhotoUrl } from "../../services/photoStorage/photoStorage.hooks";
import { Button } from "../../components/Button/Button";
import { Field } from "../../components/Field/Field";
import { Input, TextArea } from "../../components/Field/Field.styles";
import { Icon } from "../../components/Icon/Icon";
import { ButtonRow } from "../../components/ScreenLayout/ScreenLayout";
import { AvatarButton, AvatarPreview, Identity, IdentityBio, IdentityName, IdentityText } from "./ProfileScreen.styles";

type Props = {
  profile: Profile;
  onProfile: (patch: Partial<Profile>) => void;
  onAvatar: (file: File) => void;
};

export function ProfileIdentity({ profile, onProfile, onAvatar }: Props) {
  const avatarInput = useRef<HTMLInputElement>(null);
  const avatarUrl = usePhotoUrl(profile.avatarId ?? "", "thumb");
  const [draft, setDraft] = useState<{ name: string; bio: string } | null>(null);

  const save = () => {
    if (!draft) return;
    onProfile({ name: draft.name.trim() || undefined, bio: draft.bio.trim() || undefined });
    setDraft(null);
  };

  return (
    <>
      <Identity>
        <AvatarButton type="button" onClick={() => avatarInput.current?.click()} title={profile.avatarId ? "Zmień zdjęcie" : "Dodaj zdjęcie"}>
          <AvatarPreview>
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{profile.name?.trim()[0]?.toUpperCase() ?? "?"}</span>}
          </AvatarPreview>
          <Icon name="camera" size={15} />
        </AvatarButton>
        <IdentityText>
          <IdentityName $empty={!profile.name}>{profile.name ?? "Dodaj nick"}</IdentityName>
          <IdentityBio $empty={!profile.bio}>{profile.bio ?? "Kilka słów o Twoich podróżach…"}</IdentityBio>
        </IdentityText>
        {!draft && (
          <Button
            variant="icon"
            onClick={() => setDraft({ name: profile.name ?? "", bio: profile.bio ?? "" })}
            aria-label="Edytuj profil"
            title="Edytuj profil"
          >
            <Icon name="edit" />
          </Button>
        )}
      </Identity>
      <input
        ref={avatarInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAvatar(file);
          e.target.value = "";
        }}
      />

      {draft && (
        <>
          <Field label="Imię lub nick">
            <Input
              autoFocus
              value={draft.name}
              maxLength={60}
              placeholder="Np. Ania w drodze"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </Field>
          <Field label="O mnie">
            <TextArea
              rows={2}
              maxLength={200}
              placeholder="Kilka słów o Twoich podróżach…"
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            />
          </Field>
          <ButtonRow>
            <Button variant="primary" onClick={save}>
              Zapisz
            </Button>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Anuluj
            </Button>
          </ButtonRow>
        </>
      )}
    </>
  );
}
