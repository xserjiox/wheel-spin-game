import { describe, expect, it } from "vitest";
import { shouldPreventIndexing } from "../src/shared/http/search-indexing";

describe("search indexing policy", () => {
  it("allows public assets and localized home pages", () => {
    expect(shouldPreventIndexing("/")).toBe(false);
    expect(shouldPreventIndexing("/ru/")).toBe(false);
    expect(shouldPreventIndexing("/assets/index.js")).toBe(false);
  });

  it("prevents indexing rooms, APIs, sockets, and health endpoints", () => {
    expect(shouldPreventIndexing("/r/Ab7xK2pQ")).toBe(true);
    expect(shouldPreventIndexing("/r/Ab7xK2pQ?invite=true")).toBe(true);
    expect(shouldPreventIndexing("/api/rooms/Ab7xK2pQ/meta")).toBe(true);
    expect(shouldPreventIndexing("/socket.io/")).toBe(true);
    expect(shouldPreventIndexing("/health")).toBe(true);
    expect(shouldPreventIndexing("/ready")).toBe(true);
  });
});
