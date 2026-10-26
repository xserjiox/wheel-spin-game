import { describe, expect, it } from "vitest";
import { JoinLimiterService } from "../src/modules/rooms/infrastructure/join-limiter.service";
import {
  RateLimitExceededException,
  RateLimiterService,
} from "../src/shared/redis/rate-limiter.service";
import type { RedisService } from "../src/shared/redis/redis.service";

function createLimiter(): JoinLimiterService {
  const redis = {
    isConfigured: () => false,
    isRequired: () => false,
  } as RedisService;
  return new JoinLimiterService(new RateLimiterService(redis));
}

describe("join limiter", () => {
  it("lets a classroom behind one IP join the same room", async () => {
    const limiter = createLimiter();

    for (let student = 0; student < 60; student += 1) {
      await expect(limiter.assertJoinAllowed("10.0.0.1", "CLASS001")).resolves.toBe(
        undefined,
      );
      await expect(
        limiter.assertSocketJoinAllowed("10.0.0.1", "CLASS001"),
      ).resolves.toBe(undefined);
    }
  });

  it("keeps a separate join budget for each room", async () => {
    const limiter = createLimiter();

    for (let attempt = 0; attempt < 100; attempt += 1) {
      await limiter.assertJoinAllowed("10.0.0.1", "ROOM0001");
    }
    await expect(
      limiter.assertJoinAllowed("10.0.0.1", "ROOM0001"),
    ).rejects.toBeInstanceOf(RateLimitExceededException);
    await expect(limiter.assertJoinAllowed("10.0.0.1", "ROOM0002")).resolves.toBe(
      undefined,
    );
  });

  it("tolerates a classroom's password typos before blocking the room", async () => {
    const limiter = createLimiter();

    for (let typo = 0; typo < 30; typo += 1) {
      await limiter.assertJoinAllowed("10.0.0.1", "LOCKED01");
      await limiter.failJoin("10.0.0.1", "LOCKED01");
    }
    await expect(
      limiter.assertJoinAllowed("10.0.0.1", "LOCKED01"),
    ).rejects.toBeInstanceOf(RateLimitExceededException);

    await limiter.successJoin("10.0.0.1", "LOCKED01");
    await expect(limiter.assertJoinAllowed("10.0.0.1", "LOCKED01")).resolves.toBe(
      undefined,
    );
  });
});
