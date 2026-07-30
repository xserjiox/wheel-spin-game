import { Injectable } from "@nestjs/common";
import {
  RateLimitExceededException,
  RateLimiterService,
} from "../../../shared/redis/rate-limiter.service";

function positiveInteger(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

@Injectable()
export class JoinLimiterService {
  constructor(private readonly rateLimiter: RateLimiterService) {}

  async assertCreateAllowed(ip: string): Promise<void> {
    await this.rateLimiter.assertAllowed(
      "room-create",
      ip,
      positiveInteger("RATE_LIMIT_CREATE_MAX", 5),
      positiveInteger("RATE_LIMIT_CREATE_WINDOW_MS", 10 * 60_000),
    );
  }

  async assertJoinAllowed(ip: string, code: string): Promise<void> {
    await this.rateLimiter.assertAllowed(
      "room-join",
      ip,
      positiveInteger("RATE_LIMIT_JOIN_REQUEST_MAX", 30),
      positiveInteger("RATE_LIMIT_JOIN_REQUEST_WINDOW_MS", 5 * 60_000),
    );

    const failureLimit = positiveInteger("RATE_LIMIT_JOIN_FAILURE_MAX", 8);
    const failure = await this.rateLimiter.check(
      "room-join-failure",
      `${ip}:${code}`,
      failureLimit,
    );
    if (!failure.allowed) {
      throw new RateLimitExceededException(failure.retryAfterSeconds);
    }
  }

  async failJoin(ip: string, code: string): Promise<void> {
    await this.rateLimiter.consume(
      "room-join-failure",
      `${ip}:${code}`,
      positiveInteger("RATE_LIMIT_JOIN_FAILURE_MAX", 8),
      positiveInteger("RATE_LIMIT_JOIN_FAILURE_WINDOW_MS", 5 * 60_000),
    );
  }

  async successJoin(ip: string, code: string): Promise<void> {
    await this.rateLimiter.reset("room-join-failure", `${ip}:${code}`);
  }

  async assertSocketJoinAllowed(ip: string, code: string): Promise<void> {
    await this.rateLimiter.assertAllowed(
      "socket-join",
      `${ip}:${code}`,
      positiveInteger("RATE_LIMIT_SOCKET_JOIN_MAX", 20),
      positiveInteger("RATE_LIMIT_SOCKET_JOIN_WINDOW_MS", 60_000),
    );
  }

  async assertMutationAllowed(participantId: string, action: string): Promise<void> {
    await this.rateLimiter.assertAllowed(
      `socket-mutation:${action}`,
      participantId,
      positiveInteger("RATE_LIMIT_WS_MAX", 30),
      positiveInteger("RATE_LIMIT_WS_WINDOW_MS", 10_000),
    );
  }
}
