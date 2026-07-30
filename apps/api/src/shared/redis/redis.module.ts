import { Module } from "@nestjs/common";
import { RateLimiterService } from "./rate-limiter.service";
import { RedisService } from "./redis.service";

@Module({
  providers: [RedisService, RateLimiterService],
  exports: [RedisService, RateLimiterService],
})
export class RedisModule {}
