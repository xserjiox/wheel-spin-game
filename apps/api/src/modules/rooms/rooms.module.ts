import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { RedisModule } from "../../shared/redis/redis.module";
import { SecurityModule } from "../../shared/security/security.module";
import { RoomsService } from "./application/rooms.service";
import { JoinLimiterService } from "./infrastructure/join-limiter.service";
import { RoomCleanupService } from "./infrastructure/room-cleanup.service";
import { RoomsController } from "./presentation/http/rooms.controller";
import { RoomsGateway } from "./presentation/ws/rooms.gateway";

@Module({
  imports: [DatabaseModule, RedisModule, SecurityModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway, JoinLimiterService, RoomCleanupService],
  exports: [RoomsService],
})
export class RoomsModule {}
