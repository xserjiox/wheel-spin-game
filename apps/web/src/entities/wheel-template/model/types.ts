export type WheelSelectionMode = "REPEAT" | "ELIMINATION";

export type WheelTemplate = {
  id: string;
  name: string;
  roomTitle?: string;
  options: string[];
  selectionMode: WheelSelectionMode;
  createdAt: string;
  updatedAt: string;
};

export type WheelTemplateStore = {
  version: 2;
  templates: WheelTemplate[];
};

export type WheelPresetCategory = "friends" | "team" | "classroom";

export type WheelPreset = {
  id: string;
  category: WheelPresetCategory;
  name: string;
  description: string;
  options: string[];
  selectionMode: WheelSelectionMode;
};

export type WheelSetupSelection = {
  id: string;
  source: "preset" | "template";
  name: string;
  roomTitle: string;
  options: string[];
  selectionMode: WheelSelectionMode;
};

export type WheelTemplateErrorCode =
  "INVALID_TEMPLATE" | "TEMPLATE_LIMIT" | "STORAGE_UNAVAILABLE";

export class WheelTemplateError extends Error {
  constructor(readonly code: WheelTemplateErrorCode) {
    super(code);
    this.name = "WheelTemplateError";
  }
}
