import { ServiceUnavailableException } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RateLimiterService } from "../src/shared/redis/rate-limiter.service";
import type { RedisService } from "../src/shared/redis/redis.service";

describe("rate limiter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("expires local fallback entries and enforces the configured limit", async () => {
    vi.useFakeTimers();
    const redis = {
      isConfigured: () => false,
      isRequired: () => false,
    } as RedisService;
    const limiter = new RateLimiterService(redis);

    await expect(limiter.consume("test", "client", 2, 1_000)).resolves.toMatchObject({
      allowed: true,
      count: 1,
    });
    await expect(limiter.consume("test", "client", 2, 1_000)).resolves.toMatchObject({
      allowed: true,
      count: 2,
    });
    await expect(limiter.consume("test", "client", 2, 1_000)).resolves.toMatchObject({
      allowed: false,
      count: 3,
    });

    await vi.advanceTimersByTimeAsync(1_001);
    await expect(limiter.consume("test", "client", 2, 1_000)).resolves.toMatchObject({
      allowed: true,
      count: 1,
    });
  });

  it("fails closed when required Redis is unavailable", async () => {
    const redis = {
      isConfigured: () => true,
      isRequired: () => true,
      execute: vi.fn().mockRejectedValue(new Error("offline")),
    } as unknown as RedisService;
    const limiter = new RateLimiterService(redis);

    await expect(limiter.consume("test", "client", 2, 1_000)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
