import fastifyCookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { join } from "node:path";
import { AppModule } from "./app/app.module";
import { RedisIoAdapter } from "./shared/realtime/redis-io.adapter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
  );
  await app.register(fastifyCookie);
  await app.register(fastifyStatic, {
    root: join(__dirname, "..", "..", "web", "dist"),
  });

  const socketAdapter = new RedisIoAdapter(app);
  await socketAdapter.connect();
  app.useWebSocketAdapter(socketAdapter);

  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
}

void bootstrap();
