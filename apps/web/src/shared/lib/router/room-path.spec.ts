import { describe, expect, it } from "vitest";
import { roomPath } from "./room-path";

describe("room links", () => {
  it("builds an encoded invite path", () => {
    expect(roomPath(" Ab7xK2pQ ")).toBe("/r/Ab7xK2pQ");
    expect(roomPath("room with spaces")).toBe("/r/room%20with%20spaces");
  });
});
