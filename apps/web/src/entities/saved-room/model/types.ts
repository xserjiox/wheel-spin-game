export type SavedRoom = {
  code: string;
  title: string;
  role: "HOST" | "GUEST";
  createdAt: string;
  lastOpenedAt: string;
  expiresAt: string;
};

export type SavedRoomStore = {
  version: 2;
  rooms: SavedRoom[];
};
