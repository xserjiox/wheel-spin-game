// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { openModalLayer } from "./modal-layer";

describe("modal layers", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("keeps scrolling locked until the last stacked dialog closes, in any order", () => {
    const invite = openModalLayer();
    const result = openModalLayer();
    expect(document.body.style.overflow).toBe("hidden");

    invite.close();
    expect(document.body.style.overflow).toBe("hidden");

    result.close();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores the overflow the page had before the first dialog opened", () => {
    document.body.style.overflow = "clip";
    const layer = openModalLayer();
    layer.close();
    expect(document.body.style.overflow).toBe("clip");
  });

  it("reports only the most recently opened dialog as the top one", () => {
    const lower = openModalLayer();
    const upper = openModalLayer();
    expect(lower.isTop()).toBe(false);
    expect(upper.isTop()).toBe(true);

    upper.close();
    expect(lower.isTop()).toBe(true);
    expect(upper.isTop()).toBe(false);

    upper.close();
    lower.close();
    expect(document.body.style.overflow).toBe("");
  });
});
