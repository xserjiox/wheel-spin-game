import { describe, expect, it } from "vitest";
import { renderRoomPreviewDocument } from "../src/modules/system/presentation/room-preview";

const template = `<!doctype html>
<html>
  <head>
    <!-- SEO_HEAD_START -->
    <meta name="robots" content="noindex, nofollow" />
    <title>GatherWheel — shared room</title>
    <!-- SEO_HEAD_END -->
  </head>
</html>`;

describe("room preview metadata", () => {
  it("replaces the private app head with complete Open Graph metadata", () => {
    const document = renderRoomPreviewDocument(template, {
      roomTitle: "Friday wheel",
      roomUrl: "https://gatherwheel.com/r/Ab7xK2pQ",
      imageUrl: "https://gatherwheel.com/gatherwheel-preview.jpg",
    });

    expect(document).toContain(
      '<meta property="og:title" content="Friday wheel | GatherWheel" />',
    );
    expect(document).toContain(
      '<meta property="og:url" content="https://gatherwheel.com/r/Ab7xK2pQ" />',
    );
    expect(document).toContain(
      '<meta property="og:image" content="https://gatherwheel.com/gatherwheel-preview.jpg" />',
    );
    expect(document).toContain(
      '<meta name="twitter:card" content="summary_large_image" />',
    );
    expect(document).not.toContain('name="robots"');
  });

  it("escapes room-controlled metadata", () => {
    const document = renderRoomPreviewDocument(template, {
      roomTitle: 'Friends & <Guests> "Wheel"',
      roomUrl: "https://gatherwheel.com/r/Ab7xK2pQ",
      imageUrl: "https://gatherwheel.com/gatherwheel-preview.jpg",
    });

    expect(document).toContain(
      "Friends &amp; &lt;Guests&gt; &quot;Wheel&quot; | GatherWheel",
    );
    expect(document).not.toContain("<Guests>");
  });

  it("fails closed when the app template has no SEO markers", () => {
    expect(() =>
      renderRoomPreviewDocument("<html></html>", {
        roomTitle: "Friday wheel",
        roomUrl: "https://gatherwheel.com/r/Ab7xK2pQ",
        imageUrl: "https://gatherwheel.com/gatherwheel-preview.jpg",
      }),
    ).toThrow("SEO head markers");
  });
});
