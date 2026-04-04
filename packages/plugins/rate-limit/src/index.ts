import type { Axiom, Context } from "@axiom/core";

export interface RateLimitOptions {
  /**
   * The time window in milliseconds.
   */
  windowMs?: number;
  /**
   * Maximum hits per window.
   */
  limit?: number;
  /**
   * Function to generate a unique key for the client (usually based on IP).
   */
  keyGenerator?: (ctx: Context<any, any, any>) => string;
  /**
   * Message sent when the limit is exceeded.
   */
  message?: string;
}

export interface RateLimitStore {
  increment: (
    key: string,
    windowMs: number,
  ) => Promise<{ current: number; resetTime: number }>;
}

/**
 * A simple in-memory store with automatic cleanup.
 */
class MemoryStore implements RateLimitStore {
  private hits = new Map<string, { count: number; expires: number }>();

  async increment(key: string, windowMs: number) {
    const now = Date.now();
    const hit = this.hits.get(key);

    if (!hit || hit.expires < now) {
      const resetTime = now + windowMs;
      this.hits.set(key, { count: 1, expires: resetTime });
      return { current: 1, resetTime };
    }

    hit.count++;
    return { current: hit.count, resetTime: hit.expires };
  }
}

/**
 * Rate limiting plugin for Axiom.
 */
export const rateLimit = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    limit = 60,
    message = "Too many requests, please try again later.",
    keyGenerator = (ctx) =>
      ctx.request.headers.get("x-forwarded-for") || "unknown",
  } = options;

  const store = new MemoryStore();

  return <T extends Record<string, any>, D extends Record<string, any>>(
    app: Axiom<T, D>,
  ) => {
    return app.onBeforeHandle(async (ctx) => {
      const key = keyGenerator(ctx);
      const { current, resetTime } = await store.increment(key, windowMs);

      // Add rate limit headers
      const headers: Record<string, string> = {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": Math.max(0, limit - current).toString(),
        "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
      };

      Object.entries(headers).forEach(([name, value]) => {
        ctx.setResponseHeader(name, value);
      });

      if (current > limit) {
        return new Response(JSON.stringify({ status: "error", message }), {
          status: 429,
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(
              (resetTime - Date.now()) / 1000,
            ).toString(),
          },
        });
      }
    });
  };
};
