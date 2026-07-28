import { HttpException, Injectable } from "@nestjs/common";

type Attempt = { count: number; resetAt: number };

@Injectable()
export class JoinLimiterService {
  private readonly attempts = new Map<string, Attempt>();

  assertAllowed(key: string): void {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    if (attempt && attempt.resetAt > now && attempt.count >= 8) {
      throw new HttpException(
        "Слишком много попыток. Попробуйте через несколько минут.",
        429,
      );
    }
  }

  fail(key: string): void {
    const now = Date.now();
    const current = this.attempts.get(key);
    if (!current || current.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + 5 * 60_000 });
      return;
    }
    current.count += 1;
  }

  success(key: string): void {
    this.attempts.delete(key);
  }
}
