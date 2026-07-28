// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  createWheelTemplate,
  deleteWheelTemplate,
  readWheelTemplates,
  renameWheelTemplate,
  WHEEL_TEMPLATE_LIMIT,
  WHEEL_TEMPLATE_STORAGE_KEY,
} from "./wheel-template-storage";
import { WheelTemplateError } from "./types";

describe("wheel template storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores a normalized, versioned template", () => {
    const template = createWheelTemplate(window.localStorage, {
      name: "  Friday   lunch ",
      options: [" Pizza ", "  Sushi  set "],
    });

    expect(template.name).toBe("Friday lunch");
    expect(template.options).toEqual(["Pizza", "Sushi set"]);
    expect(readWheelTemplates(window.localStorage)).toEqual([template]);
    expect(
      JSON.parse(window.localStorage.getItem(WHEEL_TEMPLATE_STORAGE_KEY) ?? ""),
    ).toMatchObject({ version: 1 });
  });

  it("renames and deletes a template", () => {
    const template = createWheelTemplate(window.localStorage, {
      name: "Lunch",
      options: ["Pizza", "Sushi"],
    });

    expect(
      renameWheelTemplate(window.localStorage, template.id, "Dinner")[0].name,
    ).toBe("Dinner");
    expect(deleteWheelTemplate(window.localStorage, template.id)).toEqual([]);
  });

  it("enforces the local template limit", () => {
    for (let index = 0; index < WHEEL_TEMPLATE_LIMIT; index += 1) {
      createWheelTemplate(window.localStorage, {
        name: `Template ${index}`,
        options: ["One", "Two"],
      });
    }

    expect(() =>
      createWheelTemplate(window.localStorage, {
        name: "One too many",
        options: ["One", "Two"],
      }),
    ).toThrowError(
      expect.objectContaining<Partial<WheelTemplateError>>({
        code: "TEMPLATE_LIMIT",
      }),
    );
  });

  it("ignores invalid or unsupported stored data", () => {
    window.localStorage.setItem(
      WHEEL_TEMPLATE_STORAGE_KEY,
      JSON.stringify({ version: 2, templates: [{ name: "Broken" }] }),
    );

    expect(readWheelTemplates(window.localStorage)).toEqual([]);
  });
});
