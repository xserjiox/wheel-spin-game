import { useCallback, useEffect, useState } from "react";
import {
  readSavedRooms,
  removeSavedRoom,
  saveRoom,
  SAVED_ROOM_STORAGE_KEY,
} from "./saved-room-storage";
import type { SavedRoom } from "./types";

export function useSavedRooms() {
  const [rooms, setRooms] = useState<SavedRoom[]>(() =>
    readSavedRooms(window.localStorage),
  );

  useEffect(() => {
    const syncRooms = (event: StorageEvent) => {
      if (event.key === SAVED_ROOM_STORAGE_KEY) {
        setRooms(readSavedRooms(window.localStorage));
      }
    };
    window.addEventListener("storage", syncRooms);
    return () => window.removeEventListener("storage", syncRooms);
  }, []);

  const save = useCallback(
    (state: {
      code: string;
      title: string;
      role: SavedRoom["role"];
      expiresAt: string;
    }) => {
      setRooms(saveRoom(window.localStorage, state));
    },
    [],
  );

  const remove = useCallback((code: string) => {
    setRooms(removeSavedRoom(window.localStorage, code));
  }, []);

  return { rooms, save, remove };
}
