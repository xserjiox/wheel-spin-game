const SEO_HEAD_START = "    <!-- SEO_HEAD_START -->";
const SEO_HEAD_END = "    <!-- SEO_HEAD_END -->";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderRoomPreviewDocument(
  template: string,
  {
    roomTitle,
    roomUrl,
    imageUrl,
  }: {
    roomTitle: string;
    roomUrl: string;
    imageUrl: string;
  },
): string {
  const start = template.indexOf(SEO_HEAD_START);
  const end = template.indexOf(SEO_HEAD_END);
  if (start < 0 || end < 0 || end < start) {
    throw new Error("The SEO head markers are missing from the app template");
  }

  const title = escapeHtml(`${roomTitle} | GatherWheel`);
  const description = escapeHtml(
    "Join this private shared GatherWheel room and spin one synchronized wheel together.",
  );
  const safeRoomUrl = escapeHtml(roomUrl);
  const safeImageUrl = escapeHtml(imageUrl);
  const head = `${SEO_HEAD_START}
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${safeRoomUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="GatherWheel" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${safeRoomUrl}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="The colorful GatherWheel logo" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
    <meta name="twitter:image:alt" content="The colorful GatherWheel logo" />
    <title>${title}</title>
    ${SEO_HEAD_END}`;

  return `${template.slice(0, start)}${head}${template.slice(end + SEO_HEAD_END.length)}`;
}
