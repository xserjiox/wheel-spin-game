import { Controller, Get, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { PrismaService } from "../../../shared/database/prisma.service";

@Controller()
export class SystemController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  index(@Res() reply: FastifyReply) {
    return reply.sendFile("index.html");
  }

  @Get("r/:code")
  room(@Res() reply: FastifyReply) {
    return reply.sendFile("index.html");
  }

  @Get("health")
  health() {
    return { ok: true };
  }

  @Get("ready")
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  }
}
