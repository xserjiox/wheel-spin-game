import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderHome } from "../dist-ssr/entry-server.js";

const appDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = join(appDirectory, "dist");
const templatePath = join(distDirectory, "index.html");
const publicOrigin = "__PUBLIC_ORIGIN__";
const locales = ["en", "ru", "uk", "de", "zh"];
const localePaths = {
  en: "/",
  ru: "/ru/",
  uk: "/uk/",
  de: "/de/",
  zh: "/zh/",
};
const htmlLanguages = {
  en: "en",
  ru: "ru",
  uk: "uk",
  de: "de",
  zh: "zh-CN",
};
const openGraphLocales = {
  en: "en_US",
  ru: "ru_RU",
  uk: "uk_UA",
  de: "de_DE",
  zh: "zh_CN",
};
const outputFiles = {
  en: "index.html",
  ru: "index.ru.html",
  uk: "index.uk.html",
  de: "index.de.html",
  zh: "index.zh.html",
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function absoluteUrl(path) {
  return `${publicOrigin}${path}`;
}

function alternateLinks() {
  return [
    ...locales.map((locale) => {
      const hreflang = locale === "zh" ? "zh-CN" : locale;
      return `    <link rel="alternate" hreflang="${hreflang}" href="${absoluteUrl(localePaths[locale])}" />`;
    }),
    `    <link rel="alternate" hreflang="x-default" href="${absoluteUrl("/")}" />`,
  ].join("\n");
}

function seoHead(locale, title, description) {
  const canonicalUrl = absoluteUrl(localePaths[locale]);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Wheel Spin",
    url: canonicalUrl,
    description,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Any",
    inLanguage: htmlLanguages[locale],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }).replaceAll("<", "\\u003c");

  return `    <!-- SEO_HEAD_START -->
    <meta name="description" content="${safeDescription}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonicalUrl}" />
${alternateLinks()}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Wheel Spin" />
    <meta property="og:locale" content="${openGraphLocales[locale]}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${absoluteUrl("/wheel-spin-preview.jpg")}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="The colorful Wheel Spin logo" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${absoluteUrl("/wheel-spin-preview.jpg")}" />
    <meta name="twitter:image:alt" content="The colorful Wheel Spin logo" />
    <script type="application/ld+json">${structuredData}</script>
    <title>${safeTitle}</title>
    <!-- SEO_HEAD_END -->`;
}

function noIndexHead() {
  return `    <!-- SEO_HEAD_START -->
    <meta name="description" content="A private shared Wheel Spin room." />
    <meta name="robots" content="noindex, nofollow" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Wheel Spin" />
    <meta property="og:title" content="Wheel Spin — shared room" />
    <meta property="og:description" content="Join a private shared Wheel Spin room." />
    <meta property="og:image" content="${absoluteUrl("/wheel-spin-preview.jpg")}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="The colorful Wheel Spin logo" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Wheel Spin — shared room" />
    <meta name="twitter:description" content="Join a private shared Wheel Spin room." />
    <meta name="twitter:image" content="${absoluteUrl("/wheel-spin-preview.jpg")}" />
    <title>Wheel Spin — shared room</title>
    <!-- SEO_HEAD_END -->`;
}

function replaceHead(template, head) {
  const start = template.indexOf("    <!-- SEO_HEAD_START -->");
  const endMarker = "    <!-- SEO_HEAD_END -->";
  const end = template.indexOf(endMarker);
  if (start < 0 || end < 0) {
    throw new Error("SEO head markers are missing from index.html");
  }

  return `${template.slice(0, start)}${head}${template.slice(end + endMarker.length)}`;
}

function replaceRoot(template, html) {
  const root = '<div id="root"></div>';
  if (!template.includes(root)) {
    throw new Error("The root placeholder is missing from index.html");
  }

  return template.replace(root, `<div id="root">${html}</div>`);
}

const template = await readFile(templatePath, "utf8");
await writeFile(
  join(distDirectory, "index.app.html"),
  replaceHead(template, noIndexHead()),
  "utf8",
);

for (const locale of locales) {
  const { html, title, description } = renderHome(locale);
  const localizedDocument = replaceRoot(
    replaceHead(template, seoHead(locale, title, description)),
    html,
  ).replace('<html lang="en">', `<html lang="${htmlLanguages[locale]}">`);

  await writeFile(join(distDirectory, outputFiles[locale]), localizedDocument, "utf8");
}

await rm(join(appDirectory, "dist-ssr"), { recursive: true, force: true });
