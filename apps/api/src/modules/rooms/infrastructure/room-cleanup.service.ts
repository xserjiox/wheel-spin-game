import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import { deleteExpiredRoomsBatch } from "../../../shared/database/storage-maintenance";

const CLEANUP_INTERVAL_MS = 60 * 60_000;
const CLEANUP_BATCH_SIZE = 500;
const MAX_BATCHES_PER_RUN = 10;

@Injectable()
export class RoomCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RoomCleanupService.name);
  private timer?: NodeJS.Timeout;
  private stopped = false;
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    void this.runAndSchedule();
  }

  onModuleDestroy(): void {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
  }

  private async runAndSchedule(): Promise<void> {
    if (this.running || this.stopped) return;
    this.running = true;
    try {
      let deletedRooms = 0;
      for (let batch = 0; batch < MAX_BATCHES_PER_RUN; batch += 1) {
        const deleted = await deleteExpiredRoomsBatch(this.prisma, CLEANUP_BATCH_SIZE);
        deletedRooms += deleted;
        if (deleted < CLEANUP_BATCH_SIZE) break;
      }
      if (deletedRooms > 0) {
        this.logger.log(`Deleted ${deletedRooms} expired rooms`);
      }
    } catch (error) {
      this.logger.error("Failed to delete expired rooms", error);
    } finally {
      this.running = false;
      if (!this.stopped) {
        this.timer = setTimeout(() => void this.runAndSchedule(), CLEANUP_INTERVAL_MS);
        this.timer.unref();
      }
    }
  }
}
