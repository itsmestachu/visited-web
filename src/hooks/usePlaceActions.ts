import { useCallback } from "react";
import type { Dispatch } from "../store/actions";
import type { Place } from "../types/models";
import { deletePhoto } from "../services/photoStorage";

export const usePlaceActions = (dispatch: Dispatch) => {
  const removePhoto = useCallback(
    async (placeId: string, photoId: string) => {
      dispatch({ type: "removePhoto", id: placeId, photoId });
      await deletePhoto(photoId);
    },
    [dispatch],
  );

  const removePlace = useCallback(
    async (place: Place) => {
      dispatch({ type: "removePlace", id: place.id });
      for (const id of place.photos) await deletePhoto(id);
    },
    [dispatch],
  );

  return { removePhoto, removePlace };
};
