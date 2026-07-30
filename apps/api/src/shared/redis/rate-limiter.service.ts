import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { redisPrefix } from "./redis.config";
import { RedisService } from "./redis.service";

const INCREMENT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
if ttl < 0 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { current, ttl }
`;

const MAX_LOCAL_KEYS = 10_000;

type LocalEntry = { count: number; resetAt: number };

export type RateLimitDecision = {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
};

export class RateLimitExceededException extends HttpException {
  constructor(readonly retryAfterSeconds: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: "RATE_LIMIT_EXCEEDED",
        retryAfterSeconds,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

@Injectable()
export class RateLimiterService {
  private readonly local = new Map<string, LocalEntry>();

  constructor(private readonly redis: RedisService) {}

  async consume(
    scope: string,
    identifier: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitDecision> {
    const key = this.key(scope, identifier);
    const result = await this.increment(key, windowMs);
    return {
      allowed: result.count <= limit,
      count: result.count,
      retryAfterSeconds: Math.max(1, Math.ceil(result.ttlMs / 1_000)),
    };
  }

  async assertAllowed(
    scope: string,
    identifier: string,
    limit: number,
    windowMs: number,
  ): Promise<void> {
    const decision = await this.consume(scope, identifier, limit, windowMs);
    if (!decision.allowed) {
      throw new RateLimitExceededException(decision.retryAfterSeconds);
    }
  }

  async check(
    scope: string,
    identifier: string,
    limit: number,
  ): Promise<RateLimitDecision> {
    const key = this.key(scope, identifier);
    if (!this.redis.isConfigured()) {
      const local = this.readLocal(key);
      return {
        allowed: !local || local.count < limit,
        count: local?.count ?? 0,
        retryAfterSeconds: local
          ? Math.max(1, Math.ceil((local.resetAt - Date.now()) / 1_000))
          : 1,
      };
    }

    try {
      const [countValue, ttlValue] = await this.redis.execute((client) =>
        client.mget(key).then(async ([count]) => [count, await client.pttl(key)]),
      );
      const count = Number(countValue ?? 0);
      return {
        allowed: count < limit,
        count,
        retryAfterSeconds: Math.max(1, Math.ceil(Number(ttlValue) / 1_000)),
      };
    } catch (error) {
      return this.handleRedisFailure(error, () => this.checkLocal(key, limit));
    }
  }

  async reset(scope: string, identifier: string): Promise<void> {
    const key = this.key(scope, identifier);
    this.local.delete(key);
    if (!this.redis.isConfigured()) return;

    try {
      await this.redis.execute((client) => client.del(key));
    } catch {
      // Reset is best effort after a successful operation; the key still has a TTL.
    }
  }

  private async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; ttlMs: number }> {
    if (!this.redis.isConfigured()) return this.incrementLocal(key, windowMs);

    try {
      const result = await this.redis.execute((client) =>
        client.eval(INCREMENT_SCRIPT, 1, key, windowMs),
      );
      const [count, ttlMs] = result as [number, number];
      return { count: Number(count), ttlMs: Number(ttlMs) };
    } catch (error) {
      return this.handleRedisFailure(error, () => this.incrementLocal(key, windowMs));
    }
  }

  private handleRedisFailure<T>(error: unknown, fallback: () => T): T {
    if (this.redis.isRequired()) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException("Rate limiting is unavailable");
    }
    return fallback();
  }

  private key(scope: string, identifier: string): string {
    const digest = createHash("sha256").update(identifier).digest("hex").slice(0, 32);
    return `${redisPrefix()}:rate:${scope}:${digest}`;
  }

  private incrementLocal(
    key: string,
    windowMs: number,
  ): { count: number; ttlMs: number } {
    const now = Date.now();
    this.sweepLocal(now);
    const current = this.local.get(key);
    const entry =
      current && current.resetAt > now
        ? current
        : { count: 0, resetAt: now + windowMs };
    entry.count += 1;
    this.local.set(key, entry);
    this.enforceLocalLimit();
    return { count: entry.count, ttlMs: Math.max(1, entry.resetAt - now) };
  }

  private readLocal(key: string): LocalEntry | undefined {
    const entry = this.local.get(key);
    if (!entry) return undefined;
    if (entry.resetAt <= Date.now()) {
      this.local.delete(key);
      return undefined;
    }
    return entry;
  }

  private checkLocal(key: string, limit: number): RateLimitDecision {
    const entry = this.readLocal(key);
    return {
      allowed: !entry || entry.count < limit,
      count: entry?.count ?? 0,
      retryAfterSeconds: entry
        ? Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1_000))
        : 1,
    };
  }

  private sweepLocal(now: number): void {
    for (const [key, entry] of this.local) {
      if (entry.resetAt <= now) this.local.delete(key);
    }
  }

  private enforceLocalLimit(): void {
    while (this.local.size > MAX_LOCAL_KEYS) {
      const oldestKey = this.local.keys().next().value as string | undefined;
      if (!oldestKey) return;
      this.local.delete(oldestKey);
    }
  }
}
