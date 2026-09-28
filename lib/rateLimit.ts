// Lightweight in-memory rate limiter. This protects a single warm serverless
// instance — it is a real deterrent against casual brute-forcing and email
// bombing, but it is NOT a distributed limiter: on a platform that spins up
// many concurrent instances (e.g. under real load on Vercel), each instance
// keeps its own counters. For guaranteed cross-instance limits, swap this for
// a shared store such as Upstash Redis (@upstash/ratelimit).
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) if (b.resetAt < now) buckets.delete(key);
}

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (b.count >= limit) return { allowed: false, retryAfterSeconds: Math.ceil((b.resetAt - now) / 1000) };
  b.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientIp(req: Request): string {
  const h = req.headers;
  return (h.get('x-forwarded-for')?.split(',')[0].trim()) || h.get('x-real-ip') || 'unknown';
}

export function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}
