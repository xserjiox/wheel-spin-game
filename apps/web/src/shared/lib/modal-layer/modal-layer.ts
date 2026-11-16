import { useCallback, useEffect, useRef } from "react";

export type ModalLayer = {
  isTop: () => boolean;
  close: () => void;
};

// Dialogs can stack, for example when another person's spin ends while this
// person has the invite open. One shared stack keeps page scrolling locked until
// the last dialog closes and lets only the top dialog react to Escape and Tab.
const openLayers: object[] = [];
let overflowBeforeLock = "";

export function openModalLayer(): ModalLayer {
  const token = {};
  if (openLayers.length === 0) {
    overflowBeforeLock = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openLayers.push(token);
  let open = true;

  return {
    isTop: () => open && openLayers.at(-1) === token,
    close: () => {
      if (!open) return;
      open = false;
      const index = openLayers.indexOf(token);
      if (index !== -1) openLayers.splice(index, 1);
      if (openLayers.length === 0) {
        document.body.style.overflow = overflowBeforeLock;
      }
    },
  };
}

// Returns a stable check telling whether this dialog is the topmost one.
export function useModalLayer(active = true): () => boolean {
  const layerRef = useRef<ModalLayer | null>(null);

  useEffect(() => {
    if (!active) return;
    const layer = openModalLayer();
    layerRef.current = layer;
    return () => {
      layer.close();
      if (layerRef.current === layer) layerRef.current = null;
    };
  }, [active]);

  return useCallback(() => layerRef.current?.isTop() ?? false, []);
}
