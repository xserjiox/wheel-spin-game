import type { RedisOptions } from "ioredis";

const DEFAULT_REDIS_PREFIX = "wheel-spin";

export function redisRequired(): boolean {
  return (
    process.env.REDIS_REQUIRED === "true" ||
    (process.env.NODE_ENV === "production" && process.env.REDIS_REQUIRED !== "false")
  );
}

export function redisPrefix(): string {
  const environment = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
  return (process.env.REDIS_PREFIX ?? `${DEFAULT_REDIS_PREFIX}:${environment}`).replace(
    /[^a-zA-Z0-9:_-]/g,
    "-",
  );
}

export function redisConnectionOptions(connectionName: string): RedisOptions {
  return {
    connectionName: `${redisPrefix()}:${connectionName}`,
    connectTimeout: 5_000,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy: (attempt) => Math.min(attempt * 200, 2_000),
  };
}
