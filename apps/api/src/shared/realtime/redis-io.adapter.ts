import { Logger } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import type { ServerOptions } from "socket.io";
import {
  redisConnectionOptions,
  redisPrefix,
  redisRequired,
} from "../redis/redis.config";

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor?: ReturnType<typeof createAdapter>;
  private publisher?: Redis;
  private subscriber?: Redis;

  async connect(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      if (redisRequired()) throw new Error("REDIS_URL is required in this environment");
      this.logger.warn("REDIS_URL is not configured; Socket.IO is using local memory");
      return;
    }

    const publisher = new Redis(redisUrl, redisConnectionOptions("socket-publisher"));
    const subscriber = publisher.duplicate(redisConnectionOptions("socket-subscriber"));
    publisher.on("error", (error) => this.logger.error("Redis publisher error", error));
    subscriber.on("error", (error) =>
      this.logger.error("Redis subscriber error", error),
    );

    try {
      await Promise.all([publisher.connect(), subscriber.connect()]);
      await Promise.all([publisher.ping(), subscriber.ping()]);
    } catch (error) {
      publisher.disconnect();
      subscriber.disconnect();
      if (redisRequired()) throw error;
      this.logger.warn("Redis is unavailable; Socket.IO is using local memory");
      return;
    }

    this.publisher = publisher;
    this.subscriber = subscriber;
    this.adapterConstructor = createAdapter(publisher, subscriber, {
      key: `${redisPrefix()}:socket.io`,
      publishOnSpecificResponseChannel: true,
      requestsTimeout: 3_000,
    });
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) server.adapter(this.adapterConstructor);
    return server;
  }

  async disconnect(): Promise<void> {
    const clients = [this.subscriber, this.publisher].filter(
      (client): client is Redis => Boolean(client),
    );
    this.subscriber = undefined;
    this.publisher = undefined;
    this.adapterConstructor = undefined;

    await Promise.allSettled(
      clients.map(async (client) => {
        if (client.status === "ready") {
          await client.quit();
        } else {
          client.disconnect();
        }
      }),
    );
    clients.forEach((client) => client.disconnect());
  }
}
