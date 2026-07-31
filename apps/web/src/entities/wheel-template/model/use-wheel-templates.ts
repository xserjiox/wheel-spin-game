import { useCallback, useEffect, useState } from "react";
import {
  createWheelTemplate,
  deleteWheelTemplate,
  readWheelTemplates,
  renameWheelTemplate,
  WHEEL_TEMPLATE_STORAGE_KEY,
} from "./wheel-template-storage";
import type { WheelSelectionMode, WheelTemplate } from "./types";

export function useWheelTemplates() {
  const [templates, setTemplates] = useState<WheelTemplate[]>([]);

  useEffect(() => {
    setTemplates(readWheelTemplates(window.localStorage));

    const syncTemplates = (event: StorageEvent) => {
      if (event.key === WHEEL_TEMPLATE_STORAGE_KEY) {
        setTemplates(readWheelTemplates(window.localStorage));
      }
    };
    window.addEventListener("storage", syncTemplates);
    return () => window.removeEventListener("storage", syncTemplates);
  }, []);

  const create = useCallback(
    (
      name: string,
      options: string[],
      roomTitle?: string,
      selectionMode?: WheelSelectionMode,
    ) => {
      const template = createWheelTemplate(window.localStorage, {
        name,
        options,
        roomTitle,
        selectionMode,
      });
      setTemplates(readWheelTemplates(window.localStorage));
      return template;
    },
    [],
  );

  const rename = useCallback((id: string, name: string) => {
    setTemplates(renameWheelTemplate(window.localStorage, id, name));
  }, []);

  const remove = useCallback((id: string) => {
    setTemplates(deleteWheelTemplate(window.localStorage, id));
  }, []);

  return { templates, create, rename, remove };
}
