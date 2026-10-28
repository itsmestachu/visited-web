import { useRef } from "react";
import { PhotoThumb } from "../PhotoThumb/PhotoThumb";
import { AddTile, Grid } from "./PhotoGrid.styles";
import type { PhotoGridProps } from "./PhotoGrid.types";

export function PhotoGrid({ photoIds, uploading, onOpen, onDelete, onAdd }: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Grid>
      {photoIds.map((id, i) => (
        <PhotoThumb key={id} id={id} onOpen={() => onOpen(i)} onDelete={() => onDelete(id)} />
      ))}
      <AddTile type="button" onClick={() => inputRef.current?.click()} disabled={uploading !== null}>
        {uploading ? (
          `${uploading.done}/${uploading.total}`
        ) : (
          <>
            <span>+</span>
            Dodaj zdjęcia
          </>
        )}
      </AddTile>
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
    </Grid>
  );
}
