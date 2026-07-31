import {
  WheelTemplateError,
  type WheelTemplate,
  type WheelTemplateStore,
  type WheelSelectionMode,
} from "./types";

export const WHEEL_TEMPLATE_LIMIT = 20;
export const WHEEL_TEMPLATE_STORAGE_KEY = "gatherwheel-templates";

type LegacyWheelTemplate = Omit<WheelTemplate, "roomTitle" | "selectionMode">;

function isBaseWheelTemplate(value: unknown): value is LegacyWheelTemplate {
  if (!value || typeof value !== "object") return false;
  const template = value as Partial<WheelTemplate>;

  return (
    typeof template.id === "string" &&
    template.id.length > 0 &&
    typeof template.name === "string" &&
    template.name.trim().length > 0 &&
    template.name.length <= 60 &&
    Array.isArray(template.options) &&
    template.options.length >= 2 &&
    template.options.length <= 100 &&
    template.options.every(
      (option) =>
        typeof option === "string" && option.trim().length > 0 && option.length <= 80,
    ) &&
    typeof template.createdAt === "string" &&
    typeof template.updatedAt === "string"
  );
}

function isSelectionMode(value: unknown): value is WheelSelectionMode {
  return value === "REPEAT" || value === "ELIMINATION";
}

function normalizeStoredTemplate(
  value: unknown,
  version: number,
): WheelTemplate | null {
  if (!isBaseWheelTemplate(value)) return null;
  const template = value as Partial<WheelTemplate>;
  if (version === 2 && !isSelectionMode(template.selectionMode)) return null;
  if (
    template.roomTitle !== undefined &&
    (typeof template.roomTitle !== "string" || template.roomTitle.length > 60)
  ) {
    return null;
  }

  return {
    ...value,
    roomTitle: template.roomTitle?.trim() || undefined,
    selectionMode:
      version === 2 && isSelectionMode(template.selectionMode)
        ? template.selectionMode
        : "REPEAT",
  };
}

function normalizeName(name: string): string {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > 60) {
    throw new WheelTemplateError("INVALID_TEMPLATE");
  }
  return normalized;
}

function normalizeOptions(options: string[]): string[] {
  const normalized = options.map((option) => option.trim().replace(/\s+/g, " "));

  if (
    normalized.length < 2 ||
    normalized.length > 100 ||
    normalized.some((option) => !option || option.length > 80)
  ) {
    throw new WheelTemplateError("INVALID_TEMPLATE");
  }

  return normalized;
}

export function readWheelTemplates(storage: Storage): WheelTemplate[] {
  try {
    const raw = storage.getItem(WHEEL_TEMPLATE_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Partial<WheelTemplateStore> & {
      version?: number;
    };
    if (![1, 2].includes(parsed.version ?? 0) || !Array.isArray(parsed.templates)) {
      return [];
    }

    return parsed.templates
      .map((template) => normalizeStoredTemplate(template, parsed.version ?? 1))
      .filter((template): template is WheelTemplate => Boolean(template))
      .slice(0, WHEEL_TEMPLATE_LIMIT);
  } catch {
    return [];
  }
}

function writeWheelTemplates(storage: Storage, templates: WheelTemplate[]): void {
  try {
    const value: WheelTemplateStore = {
      version: 2,
      templates,
    };
    storage.setItem(WHEEL_TEMPLATE_STORAGE_KEY, JSON.stringify(value));
  } catch {
    throw new WheelTemplateError("STORAGE_UNAVAILABLE");
  }
}

export function createWheelTemplate(
  storage: Storage,
  input: {
    name: string;
    roomTitle?: string;
    options: string[];
    selectionMode?: WheelSelectionMode;
  },
): WheelTemplate {
  const templates = readWheelTemplates(storage);
  if (templates.length >= WHEEL_TEMPLATE_LIMIT) {
    throw new WheelTemplateError("TEMPLATE_LIMIT");
  }

  const now = new Date().toISOString();
  const template: WheelTemplate = {
    id: crypto.randomUUID(),
    name: normalizeName(input.name),
    roomTitle: input.roomTitle ? normalizeName(input.roomTitle) : undefined,
    options: normalizeOptions(input.options),
    selectionMode: input.selectionMode ?? "REPEAT",
    createdAt: now,
    updatedAt: now,
  };

  writeWheelTemplates(storage, [template, ...templates]);
  return template;
}

export function renameWheelTemplate(
  storage: Storage,
  id: string,
  name: string,
): WheelTemplate[] {
  const normalizedName = normalizeName(name);
  const templates = readWheelTemplates(storage).map((template) =>
    template.id === id
      ? {
          ...template,
          name: normalizedName,
          updatedAt: new Date().toISOString(),
        }
      : template,
  );
  writeWheelTemplates(storage, templates);
  return templates;
}

export function deleteWheelTemplate(storage: Storage, id: string): WheelTemplate[] {
  const templates = readWheelTemplates(storage).filter(
    (template) => template.id !== id,
  );
  writeWheelTemplates(storage, templates);
  return templates;
}

export function clearWheelTemplates(storage: Storage): void {
  storage.removeItem(WHEEL_TEMPLATE_STORAGE_KEY);
}
