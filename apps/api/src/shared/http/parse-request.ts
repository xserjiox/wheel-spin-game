import { BadRequestException } from "@nestjs/common";
import type { ZodType } from "zod";

export function parseRequest<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new BadRequestException("INVALID_INPUT");
  }

  return result.data;
}
