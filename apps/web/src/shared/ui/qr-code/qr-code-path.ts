import { encode } from "uqr";

const QUIET_ZONE = 2;

// Draws dark modules as horizontal runs so the SVG stays small and crisp at any size.
export function qrCodePath(value: string): { path: string; size: number } {
  const { data } = encode(value, { ecc: "M", border: 0 });
  const size = data.length + QUIET_ZONE * 2;
  const segments: string[] = [];

  data.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < row.length && row[x]) x += 1;
      segments.push(
        `M${start + QUIET_ZONE} ${y + QUIET_ZONE}h${x - start}v1h-${x - start}z`,
      );
    }
  });

  return { path: segments.join(""), size };
}
