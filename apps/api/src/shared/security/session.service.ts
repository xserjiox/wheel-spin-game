import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";

@Injectable()
export class SessionService {
  create(): { token: string; hash: string } {
    const token = randomBytes(32).toString("base64url");
    return { token, hash: this.hash(token) };
  }

  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  readCookie(cookieHeader: string | undefined, cookieName: string): string | null {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(";").map((part) => part.trim());
    const prefix = `${cookieName}=`;
    const match = cookies.find((cookie) => cookie.startsWith(prefix));
    return match ? decodeURIComponent(match.slice(prefix.length)) : null;
  }
}
