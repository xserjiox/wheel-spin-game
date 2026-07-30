import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { RoomsService } from "../src/modules/rooms/application/rooms.service";
import { SystemController } from "../src/modules/system/presentation/system.controller";
import { PrismaService } from "../src/shared/database/prisma.service";
import { RedisService } from "../src/shared/redis/redis.service";

const { appTemplate } = vi.hoisted(() => ({
  appTemplate: `<!doctype html>
<html>
  <head>
    <!-- SEO_HEAD_START -->
    <meta name="robots" content="noindex, nofollow" />
    <meta property="og:title" content="GatherWheel — shared room" />
    <title>GatherWheel — shared room</title>
    <!-- SEO_HEAD_END -->
  </head>
  <body><div id="root"></div></body>
</html>`,
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(async () => appTemplate),
}));

@Module({
  controllers: [SystemController],
  providers: [
    { provide: PrismaService, useValue: {} },
    { provide: RedisService, useValue: {} },
    {
      provide: RoomsService,
      useValue: {
        meta: async (code: string) => ({
          code,
          title: "Friday & Friends",
          requiresPassword: false,
        }),
      },
    },
  ],
})
class SystemRoutesTestModule {}

describe("system route registration", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await NestFactory.create<NestFastifyApplication>(
      SystemRoutesTestModule,
      new FastifyAdapter({ routerOptions: { ignoreTrailingSlash: true } }),
      { logger: false },
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ["/en", "/"],
    ["/en/", "/"],
    ["/ru", "/ru/"],
    ["/uk", "/uk/"],
    ["/de", "/de/"],
    ["/zh", "/zh/"],
  ])("redirects %s to its canonical path", async (path, location) => {
    const response = await app
      .getHttpAdapter()
      .getInstance()
      .inject({ method: "GET", url: path });

    expect(response.statusCode).toBe(308);
    expect(response.headers.location).toBe(location);
  });

  it("keeps the noindex app head for Googlebot", async () => {
    const response = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: "GET",
        url: "/r/Ab7xK2pQ",
        headers: { host: "gatherwheel.test", "user-agent": "Googlebot/2.1" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.headers.vary).toBe("User-Agent");
    expect(response.body).toContain(
      '<meta name="robots" content="noindex, nofollow" />',
    );
    expect(response.body).not.toContain('property="og:url"');
  });

  it("serves dynamic preview metadata only to a known preview bot", async () => {
    const response = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: "GET",
        url: "/r/Ab7xK2pQ?invite=true",
        headers: {
          host: "gatherwheel.test",
          "user-agent": "TelegramBot (like TwitterBot)",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.headers.vary).toBe("User-Agent");
    expect(response.body).not.toContain('name="robots"');
    expect(response.body).toContain(
      '<meta property="og:title" content="Friday &amp; Friends | GatherWheel" />',
    );
    expect(response.body).toContain(
      '<meta property="og:url" content="http://gatherwheel.test/r/Ab7xK2pQ" />',
    );
  });
});
