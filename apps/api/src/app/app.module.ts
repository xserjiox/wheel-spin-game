import { Module } from "@nestjs/common";
import { RoomsModule } from "../modules/rooms/rooms.module";
import { SystemModule } from "../modules/system/system.module";

@Module({
  imports: [RoomsModule, SystemModule],
})
export class AppModule {}
