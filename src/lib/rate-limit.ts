"use server";

// Note: This is an in-memory rate limiter. In a multi-instance/serverless environment,
// it is better to use Redis (e.g., Upstash) or a similar shared store.
// For single instances, this works perfectly.

const trackers = new Map<string, { count: number; expires: number }>();

/**
 * Basic rate limiter
 * @param key Unique key to track (e.g., IP + Action Name)
 * @param limit Number of allowed requests in the window
 * @param windowMs Window size in milliseconds
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const tracker = trackers.get(key);

  if (!tracker || now > tracker.expires) {
    trackers.set(key, { count: 1, expires: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (tracker.count >= limit) {
    return { success: false, remaining: 0 };
  }

  tracker.count += 1;
  return { success: true, remaining: limit - tracker.count };
}

// Cleanup expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of trackers.entries()) {
      if (now > value.expires) {
        trackers.delete(key);
      }
    }
  }, 60000); // Cleanup every minute
}
