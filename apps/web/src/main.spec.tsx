// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRoot, hydrateRoot, render } = vi.hoisted(() => ({
  createRoot: vi.fn(),
  hydrateRoot: vi.fn(),
  render: vi.fn(),
}));

vi.mock("react-dom/client", () => ({ createRoot, hydrateRoot }));
vi.mock("@/app/App", () => ({ App: () => null }));

describe("localized application bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    createRoot.mockReturnValue({ render });
    window.localStorage.clear();
    document.body.innerHTML = '<div id="root"><h1>Pre-rendered home</h1></div>';
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["ms-MY"]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
    document.body.replaceChildren();
  });

  it("replaces English home markup when the detected language differs", async () => {
    window.history.replaceState({ key: "initial" }, "", "/?invite=example#faq");
    const historyLength = window.history.length;
    await import("./main");

    expect(hydrateRoot).not.toHaveBeenCalled();
    expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(render).toHaveBeenCalledOnce();
    expect(document.getElementById("root")?.hasChildNodes()).toBe(false);
    expect(window.location.pathname).toBe("/ms/");
    expect(window.location.search).toBe("?invite=example");
    expect(window.location.hash).toBe("#faq");
    expect(window.history.length).toBe(historyLength);
    expect(window.history.state).toEqual({ key: "initial" });
  });

  it("hydrates an explicit localized home even if the system language differs", async () => {
    window.history.replaceState(null, "", "/vi/");
    await import("./main");

    expect(createRoot).not.toHaveBeenCalled();
    expect(hydrateRoot).toHaveBeenCalledWith(
      document.getElementById("root"),
      expect.anything(),
    );
    expect(document.getElementById("root")?.hasChildNodes()).toBe(true);
  });

  it("hydrates the English home when no system language is supported", async () => {
    window.history.replaceState(null, "", "/");
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["fr-FR"]);
    await import("./main");

    expect(createRoot).not.toHaveBeenCalled();
    expect(hydrateRoot).toHaveBeenCalledOnce();
  });
});
