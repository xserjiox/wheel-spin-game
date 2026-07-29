export type SavedHostRoom = {
  code: string;
  title: string;
  createdAt: string;
  lastOpenedAt: string;
  expiresAt: string;
};

export type SavedHostRoomStore = {
  version: 1;
  rooms: SavedHostRoom[];
};
