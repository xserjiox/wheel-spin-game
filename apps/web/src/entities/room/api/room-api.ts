import { apiRequest } from "@/shared/api/http";
import type { RoomMeta, RoomState } from "../model/types";

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
