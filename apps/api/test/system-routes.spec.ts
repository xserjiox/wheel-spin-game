import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SystemController } from "../src/modules/system/presentation/system.controller";
import { PrismaService } from "../src/shared/database/prisma.service";
import { RedisService } from "../src/shared/redis/redis.service";

@Module({
  controllers: [SystemController],
  providers: [
    { provide: PrismaService, useValue: {} },
    { provide: RedisService, useValue: {} },
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
});
