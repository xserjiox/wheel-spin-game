import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";

@Injectable()
export class RoomCleanupService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.removeExpiredRooms(), 60 * 60_000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async removeExpiredRooms(): Promise<void> {
    await this.prisma.room.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
}
