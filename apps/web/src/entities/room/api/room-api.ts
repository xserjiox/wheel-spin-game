import { apiRequest } from "@/shared/api/http";
import type { PersonalDataExport, RoomMeta, RoomState } from "../model/types";

export function createRoom(input: {
  hostName: string;
  title: string;
  password: string;
  options?: string[];
}) {
  return apiRequest<{ code: string; state: RoomState }>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getRoomMeta(code: string) {
  return apiRequest<RoomMeta>(`/api/rooms/${encodeURIComponent(code)}/meta`);
}

export function restoreRoom(code: string) {
  return apiRequest<{ state: RoomState }>(
    `/api/rooms/${encodeURIComponent(code)}/state`,
  );
}

export function joinRoom(code: string, input: { name: string; password: string }) {
  return apiRequest<{ state: RoomState }>(
    `/api/rooms/${encodeURIComponent(code)}/join`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function exportOwnData(code: string) {
  return apiRequest<PersonalDataExport>(
    `/api/rooms/${encodeURIComponent(code)}/me/export`,
  );
}

export function deleteOwnData(code: string) {
  return apiRequest<{ ok: true }>(`/api/rooms/${encodeURIComponent(code)}/me`, {
    method: "DELETE",
  });
}

export function deleteRoomData(code: string) {
  return apiRequest<{ ok: true }>(`/api/rooms/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}
