export type WheelTemplate = {
  id: string;
  name: string;
  options: string[];
  createdAt: string;
  updatedAt: string;
};

export type WheelTemplateStore = {
  version: 1;
  templates: WheelTemplate[];
};

export type WheelTemplateErrorCode =
  "INVALID_TEMPLATE" | "TEMPLATE_LIMIT" | "STORAGE_UNAVAILABLE";

export class WheelTemplateError extends Error {
  constructor(readonly code: WheelTemplateErrorCode) {
    super(code);
    this.name = "WheelTemplateError";
  }
}
