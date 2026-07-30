import { Module } from "@nestjs/common";
import { RoomsModule } from "../rooms/rooms.module";
import { DatabaseModule } from "../../shared/database/database.module";
import { RedisModule } from "../../shared/redis/redis.module";
import { SystemController } from "./presentation/system.controller";

@Module({
  imports: [DatabaseModule, RedisModule, RoomsModule],
  controllers: [SystemController],
})
export class SystemModule {}
