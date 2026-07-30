import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Ip,
  Param,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { roomCookieName } from "../../../../shared/config/room.config";
import { parseRequest } from "../../../../shared/http/parse-request";
import { RoomsService } from "../../application/rooms.service";
import {
  createRoomSchema,
  joinRoomSchema,
  roomCodeSchema,
} from "../../contracts/room.contracts";
import { JoinLimiterService } from "../../infrastructure/join-limiter.service";
import { RoomsGateway } from "../ws/rooms.gateway";

@Controller("api/rooms")
export class RoomsController {
  constructor(
    private readonly rooms: RoomsService,
    private readonly limiter: JoinLimiterService,
    private readonly gateway: RoomsGateway,
  ) {}

  @Post()
  async create(@Body() body: unknown, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parseRequest(createRoomSchema, body);
    const result = await this.rooms.create(input);
    this.setSessionCookie(reply, result.code, result.token);
    return { code: result.code, state: result.state };
  }

  @Get(":code/meta")
  async meta(@Param("code") rawCode: string) {
    const code = parseRequest(roomCodeSchema, rawCode);
    return this.rooms.meta(code);
  }

  @Get(":code/state")
  async state(@Param("code") rawCode: string, @Req() request: FastifyRequest) {
    const code = parseRequest(roomCodeSchema, rawCode);
    const token = request.cookies[roomCookieName(code)] ?? null;
    const participant = await this.rooms.authenticate(code, token);
    return { state: await this.rooms.getState(code, participant) };
  }

  @Post(":code/join")
  @HttpCode(200)
  async join(
    @Param("code") rawCode: string,
    @Body() body: unknown,
    @Ip() ip: string,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const code = parseRequest(roomCodeSchema, rawCode);
    const input = parseRequest(joinRoomSchema, body);
    const limitKey = `${ip}:${code}`;
    this.limiter.assertAllowed(limitKey);
    try {
      const result = await this.rooms.join(code, input);
      this.limiter.success(limitKey);
      this.setSessionCookie(reply, code, result.token);
      return { state: result.state };
    } catch (error) {
      this.limiter.fail(limitKey);
      throw error;
    }
  }

  @Get(":code/me/export")
  async exportOwnData(
    @Param("code") rawCode: string,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { code, participant } = await this.authenticateRequest(rawCode, request);
    reply.header("Cache-Control", "no-store");
    reply.header(
      "Content-Disposition",
      `attachment; filename="wheel-spin-${code.toLowerCase()}-data.json"`,
    );
    return this.rooms.exportOwnData(participant);
  }

  @Delete(":code/me")
  async deleteOwnData(
    @Param("code") rawCode: string,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { code, participant } = await this.authenticateRequest(rawCode, request);
    await this.rooms.deleteOwnData(participant);
    this.clearSessionCookie(reply, code);
    await this.gateway.disconnectParticipant(
      code,
      participant.id,
      "participant.deleted",
    );
    return { ok: true };
  }

  @Delete(":code")
  async deleteRoom(
    @Param("code") rawCode: string,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { code, participant } = await this.authenticateRequest(rawCode, request);
    await this.rooms.deleteRoom(participant);
    this.clearSessionCookie(reply, code);
    await this.gateway.disconnectRoom(code);
    return { ok: true };
  }

  private async authenticateRequest(rawCode: string, request: FastifyRequest) {
    const code = parseRequest(roomCodeSchema, rawCode);
    const token = request.cookies[roomCookieName(code)] ?? null;
    const participant = await this.rooms.authenticate(code, token);
    return { code, participant };
  }

  private setSessionCookie(reply: FastifyReply, code: string, token: string): void {
    reply.setCookie(roomCookieName(code), token, {
      httpOnly: true,
      secure:
        process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  private clearSessionCookie(reply: FastifyReply, code: string): void {
    reply.clearCookie(roomCookieName(code), { path: "/" });
  }
}
