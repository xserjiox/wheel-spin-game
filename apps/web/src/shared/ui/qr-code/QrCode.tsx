import { useMemo } from "react";
import { qrCodePath } from "./qr-code-path";

export function QrCode({ value, label }: { value: string; label: string }) {
  const { path, size } = useMemo(() => qrCodePath(value), [value]);

  return (
    <svg
      className="qr-code"
      role="img"
      aria-label={label}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#1d211b" />
    </svg>
  );
}
