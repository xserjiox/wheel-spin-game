import { useCallback, useEffect, useState } from "react";
import {
  readSavedHostRooms,
  removeSavedHostRoom,
  saveHostRoom,
  SAVED_HOST_ROOM_STORAGE_KEY,
} from "./saved-room-storage";
import type { SavedHostRoom } from "./types";

export function useSavedHostRooms() {
  const [rooms, setRooms] = useState<SavedHostRoom[]>(() =>
    readSavedHostRooms(window.localStorage),
  );

  useEffect(() => {
    const syncRooms = (event: StorageEvent) => {
      if (event.key === SAVED_HOST_ROOM_STORAGE_KEY) {
        setRooms(readSavedHostRooms(window.localStorage));
      }
    };
    window.addEventListener("storage", syncRooms);
    return () => window.removeEventListener("storage", syncRooms);
  }, []);

  const save = useCallback(
    (state: { code: string; title: string; expiresAt: string }) => {
      setRooms(saveHostRoom(window.localStorage, state));
    },
    [],
  );

  const remove = useCallback((code: string) => {
    setRooms(removeSavedHostRoom(window.localStorage, code));
  }, []);

  return { rooms, save, remove };
}
