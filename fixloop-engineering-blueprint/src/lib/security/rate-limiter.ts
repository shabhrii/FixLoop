import type { NextRequest } from "next/server";

/**
 * Lightweight, in-memory sliding window rate limiter for public endpoints (such as /api/v1/auth/login).
 * Protects against automated credential stuffing and brute force without adding mandatory external dependencies.
 * 
 * ARCHITECTURE & DEPLOYMENT LIMITATION:
 * This rate limiter stores buckets in process memory. It is scoped to single-instance / local pilot deployments.
 * In a multi-replica clustered production deployment, in-memory state is isolated per process and resets on restart.
 * For enterprise high-availability horizontal scaling across pods, rate limits must be backed by a shared cluster
 * store (e.g. Redis or PostgreSQL transaction-level token bucket) to prevent evasion by distributing requests across replicas.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const ipBuckets = new Map<string, RateLimitRecord>();

// Cleanup stale buckets periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 60000;
    for (const [ip, record] of ipBuckets.entries()) {
      record.timestamps = record.timestamps.filter((t) => t > cutoff);
      if (record.timestamps.length === 0) {
        ipBuckets.delete(ip);
      }
    }
  }, 300000);
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Extracts client IP with header precedence designed to limit trivial header-spoofing bypasses.
 * Uses Cloudflare CF-Connecting-IP, True-Client-IP, or leftmost verified proxy entry.
 */
export function extractClientIp(req: NextRequest): string {
  // Cloudflare verified header
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // Akamai / CloudFront verified header
  const trueClientIp = req.headers.get("true-client-ip");
  if (trueClientIp) return trueClientIp.trim();

  // Standard X-Forwarded-For: In trusted reverse proxy configurations,
  // the client IP is the first address in the comma-separated chain
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim()).filter(Boolean);
    if (ips.length > 0) {
      return ips[0];
    }
  }

  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  return "127.0.0.1";
}

export function checkRateLimit(
  identifier: string,
  limit: number = 15,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = ipBuckets.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    ipBuckets.set(identifier, record);
  }

  // Retain only requests within the active window
  record.timestamps = record.timestamps.filter((t) => t > cutoff);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    resetSeconds: windowSeconds,
  };
}
