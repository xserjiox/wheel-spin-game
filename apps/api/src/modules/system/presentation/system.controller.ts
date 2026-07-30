import { Controller, Get, Inject, Param, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaService } from "../../../shared/database/prisma.service";
import { isKnownLinkPreviewBot } from "../../../shared/http/search-indexing";
import { RedisService } from "../../../shared/redis/redis.service";
import { RoomsService } from "../../rooms/application/rooms.service";
import { renderRoomPreviewDocument } from "./room-preview";

const PUBLIC_ORIGIN_TOKEN = "__PUBLIC_ORIGIN__";
const LOCALIZED_PAGES = [
  { language: "en", path: "/" },
  { language: "ru", path: "/ru/" },
  { language: "uk", path: "/uk/" },
  { language: "de", path: "/de/" },
  { language: "zh-CN", path: "/zh/" },
] as const;

@Controller()
export class SystemController {
  private readonly frontendRoot = join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "web",
    "dist",
  );
  private readonly pageCache = new Map<string, string>();

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(RedisService)
    private readonly redis: RedisService,
    @Inject(RoomsService)
    private readonly rooms: RoomsService,
  ) {}

  private publicOrigin(request: FastifyRequest): string {
    const configuredOrigin = process.env.PUBLIC_URL;
    const requestOrigin = `${request.protocol}://${request.headers.host ?? "localhost"}`;

    try {
      return new URL(configuredOrigin || requestOrigin).origin;
    } catch {
      return new URL(requestOrigin).origin;
    }
  }

  private async page(filename: string): Promise<string> {
    const cachedPage = this.pageCache.get(filename);
    if (cachedPage) return cachedPage;

    const document = await readFile(join(this.frontendRoot, filename), "utf8");
    this.pageCache.set(filename, document);
    return document;
  }

  private async sendPage(
    filename: string,
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const document = await this.page(filename);
    return reply
      .type("text/html; charset=utf-8")
      .header("Cache-Control", "public, max-age=0, must-revalidate")
      .send(document.replaceAll(PUBLIC_ORIGIN_TOKEN, this.publicOrigin(request)));
  }

  private redirectToCanonicalPath(reply: FastifyReply, path: string) {
    return reply.code(308).header("Location", path).send();
  }

  @Get()
  index(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    return this.sendPage("index.html", request, reply);
  }

  @Get("en")
  english(@Res() reply: FastifyReply) {
    return this.redirectToCanonicalPath(reply, "/");
  }

  @Get("ru")
  russian(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    if (!request.url.split("?")[0].endsWith("/")) {
      return this.redirectToCanonicalPath(reply, "/ru/");
    }
    return this.sendPage("index.ru.html", request, reply);
  }

  @Get("uk")
  ukrainian(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    if (!request.url.split("?")[0].endsWith("/")) {
      return this.redirectToCanonicalPath(reply, "/uk/");
    }
    return this.sendPage("index.uk.html", request, reply);
  }

  @Get("de")
  german(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    if (!request.url.split("?")[0].endsWith("/")) {
      return this.redirectToCanonicalPath(reply, "/de/");
    }
    return this.sendPage("index.de.html", request, reply);
  }

  @Get("zh")
  chinese(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    if (!request.url.split("?")[0].endsWith("/")) {
      return this.redirectToCanonicalPath(reply, "/zh/");
    }
    return this.sendPage("index.zh.html", request, reply);
  }

  @Get("r/:code")
  async room(
    @Param("code") code: string,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    reply.header("Vary", "User-Agent");
    if (!isKnownLinkPreviewBot(request.headers["user-agent"])) {
      return this.sendPage("index.app.html", request, reply);
    }

    const { title } = await this.rooms.meta(code);
    const origin = this.publicOrigin(request);
    const roomUrl = new URL(request.url.split("?")[0], `${origin}/`).toString();
    const document = renderRoomPreviewDocument(await this.page("index.app.html"), {
      roomTitle: title,
      roomUrl,
      imageUrl: `${origin}/gatherwheel-preview.jpg`,
    });

    return reply
      .type("text/html; charset=utf-8")
      .header("Cache-Control", "public, max-age=0, must-revalidate")
      .send(document.replaceAll(PUBLIC_ORIGIN_TOKEN, origin));
  }

  @Get(["privacy", "cookies"])
  legal(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    return this.sendPage("index.app.html", request, reply);
  }

  @Get("robots.txt")
  robots(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    return reply
      .type("text/plain; charset=utf-8")
      .send(
        [
          "User-agent: *",
          "Allow: /",
          `Sitemap: ${this.publicOrigin(request)}/sitemap.xml`,
        ]
          .join("\n")
          .concat("\n"),
      );
  }

  @Get("sitemap.xml")
  sitemap(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    const origin = this.publicOrigin(request);
    const alternates = LOCALIZED_PAGES.map(
      ({ language, path }) =>
        `    <xhtml:link rel="alternate" hreflang="${language}" href="${origin}${path}" />`,
    )
      .concat(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/" />`,
      )
      .join("\n");
    const urls = LOCALIZED_PAGES.map(
      ({ path }) => `  <url>\n    <loc>${origin}${path}</loc>\n${alternates}\n  </url>`,
    ).join("\n");
    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      urls,
      "</urlset>",
      "",
    ].join("\n");

    return reply.type("application/xml; charset=utf-8").send(sitemap);
  }

  @Get("health")
  health() {
    return { ok: true };
  }

  @Get("ready")
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    const redis = await this.redis.ping();
    return { ok: true, redis };
  }
}
