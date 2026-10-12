// Distributed rate limiting with Upstash Redis REST (no extra dependency).
// Falls back to an in-memory counter when Upstash is not configured.
// In serverless/Vercel the in-memory store does NOT share state across
// instances, so configure UPSTASH_REDIS_REST_URL/TOKEN for real protection.

type RateResult = { ok: boolean; remaining: number; retryAfter: number }

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const memory = new Map<string, { count: number; resetAt: number }>()

function memoryLimit(key: string, limit: number, windowSec: number): RateResult {
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }
  entry.count += 1
  if (entry.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { ok: true, remaining: limit - entry.count, retryAfter: 0 }
}

// Opportunistic cleanup so the Map does not grow unbounded in long-lived instances.
function sweepMemory() {
  if (memory.size < 5000) return
  const now = Date.now()
  for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k)
}

async function upstashLimit(key: string, limit: number, windowSec: number): Promise<RateResult> {
  // Pipeline: INCR key; on first hit set EXPIRE. Read TTL to compute retryAfter.
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSec), "NX"],
      ["TTL", key],
    ]),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Upstash ${res.status}`)
  const data = (await res.json()) as Array<{ result: number }>
  const count = Number(data[0]?.result ?? 0)
  const ttl = Number(data[2]?.result ?? windowSec)
  const retryAfter = ttl > 0 ? ttl : windowSec
  if (count > limit) return { ok: false, remaining: 0, retryAfter }
  return { ok: true, remaining: Math.max(0, limit - count), retryAfter: 0 }
}

/**
 * Enforce a fixed-window rate limit for an identifier.
 * Never throws: on backend error it fails open (allows) to avoid locking out
 * legitimate users, but logs the failure.
 */
export async function rateLimit(
  identifier: string,
  opts: { limit: number; windowSec: number; prefix?: string }
): Promise<RateResult> {
  const key = `rl:${opts.prefix || "default"}:${identifier}`
  try {
    if (UPSTASH_URL && UPSTASH_TOKEN) return await upstashLimit(key, opts.limit, opts.windowSec)
    sweepMemory()
    return memoryLimit(key, opts.limit, opts.windowSec)
  } catch (err) {
    console.error("rateLimit backend error", (err as Error).message)
    return { ok: true, remaining: opts.limit, retryAfter: 0 }
  }
}

/** Extract the best-effort client IP from standard proxy headers. */
export function clientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const get = (name: string): string | undefined => {
    if (headers instanceof Headers) return headers.get(name) || undefined
    const v = headers[name] ?? headers[name.toLowerCase()]
    return Array.isArray(v) ? v[0] : v
  }
  const xff = get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return get("x-real-ip") || "unknown"
}

/** 429 JSON response helper with Retry-After header. */
export function tooMany(retryAfter: number) {
  return new Response(
    JSON.stringify({ error: "Muitas tentativas. Aguarde alguns instantes e tente novamente." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(Math.max(1, retryAfter)) } }
  )
}
