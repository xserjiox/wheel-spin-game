import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import Redis from "ioredis";
import { redisConnectionOptions, redisRequired } from "./redis.config";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly required = redisRequired();
  private client?: Redis;

  async onModuleInit(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      if (this.required) {
        throw new Error("REDIS_URL is required in this environment");
      }
      this.logger.warn("REDIS_URL is not configured; using local rate-limit fallback");
      return;
    }

    const client = new Redis(redisUrl, redisConnectionOptions("commands"));
    client.on("error", (error) => {
      this.logger.error("Redis command connection error", error);
    });
    client.on("reconnecting", () => {
      this.logger.warn("Redis command connection is reconnecting");
    });
    client.on("end", () => {
      this.logger.warn("Redis command connection ended");
    });

    this.client = client;
    try {
      await client.connect();
      await client.ping();
    } catch (error) {
      client.disconnect();
      this.client = undefined;
      if (this.required) throw error;
      this.logger.warn(
        `Redis is unavailable; using local rate-limit fallback: ${this.errorMessage(error)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    const client = this.client;
    this.client = undefined;
    if (!client) return;

    try {
      if (client.status === "ready") {
        await client.quit();
      } else {
        client.disconnect();
      }
    } catch {
      client.disconnect();
    }
  }

  isConfigured(): boolean {
    return Boolean(process.env.REDIS_URL);
  }

  isRequired(): boolean {
    return this.required;
  }

  async ping(): Promise<"ready" | "disabled"> {
    if (!this.client) {
      if (this.required) throw new ServiceUnavailableException("Redis is unavailable");
      return "disabled";
    }
    await this.client.ping();
    return "ready";
  }

  async execute<T>(operation: (client: Redis) => Promise<T>): Promise<T> {
    const client = this.client;
    if (!client) throw new ServiceUnavailableException("Redis is unavailable");
    return operation(client);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
