import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./http";

const fetchMock = vi.fn();

function successfulResponse() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiRequest headers", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(successfulResponse());
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not claim an empty DELETE request contains JSON", async () => {
    await apiRequest("/api/rooms/TestRoom", { method: "DELETE" });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(init.headers).has("Content-Type")).toBe(false);
  });

  it("sets the JSON content type when a request has a body", async () => {
    await apiRequest("/api/rooms", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });
});
