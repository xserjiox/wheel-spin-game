export type Option = {
  id: string;
  label: string;
  position: number;
};

export type ActiveSpin = {
  id: string;
  optionsSnapshot: Option[];
  winnerIndex: number;
  winnerLabel: string;
  startedAt: string;
  durationMs: number;
  finalRotation: number;
};

export type RoomParticipant = {
  id: string;
  displayName: string;
  role: "HOST" | "GUEST";
  online: boolean;
};

export type RoomState = {
  code: string;
  title: string;
  status: "LOBBY" | "SPINNING" | "CLOSED";
  version: number;
  role: "HOST" | "GUEST";
  displayName: string;
  participantCount: number;
  participants: RoomParticipant[];
  options: Option[];
  proposals: Array<{ id: string; label: string; createdAt: string }>;
  history: Array<{ id: string; winnerLabel: string; createdAt: string }>;
  activeSpin: ActiveSpin | null;
  hasPassword: boolean;
  expiresAt: string;
};

export type RoomMeta = {
  code: string;
  title: string;
  requiresPassword: boolean;
};

export type Ack<T = Record<string, never>> =
  ({ ok: true } & T) | { ok: false; error: string };

export type RoomNavigationState = {
  initialRoomState?: RoomState;
};
