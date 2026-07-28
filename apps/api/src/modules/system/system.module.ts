import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { SystemController } from "./presentation/system.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [SystemController],
})
export class SystemModule {}
