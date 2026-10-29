import { useRef } from "react";
import { Button } from "../../components/Button/Button";
import { ButtonRow, ErrorText, Muted, Section } from "../../components/ScreenLayout/ScreenLayout";
import type { BackupSectionProps } from "./StatsScreen.types";

export function BackupSection({ busy, error, onExport, onImport }: BackupSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Section title="Kopia zapasowa">
      <Muted>Dane i zdjęcia są tylko w tej przeglądarce. Pobierz kopię, żeby ich nie stracić albo przenieść na inne urządzenie.</Muted>
      <ButtonRow>
        <Button variant="primary" disabled={busy} onClick={onExport}>
          Pobierz kopię
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          Wczytaj kopię
        </Button>
      </ButtonRow>
      {error && <ErrorText>{error}</ErrorText>}
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = "";
        }}
      />
    </Section>
  );
}
