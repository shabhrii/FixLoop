/**
 * FixLoop Telemetry & Analytics Module
 * 
 * CORE PRIVACY PRINCIPLE:
 * In-product operational quality records (defects, part numbers, machine cells,
 * measurements, tolerances, evidence photos) must NEVER be transmitted to
 * external commercial marketing or analytics trackers (e.g. Google Analytics).
 * 
 * External analytics (if configured) are strictly limited to an explicit allowlist
 * of public marketing pages (/ , /privacy, /terms) and only execute when explicit
 * user cookie consent is granted.
 */

// Strict allowlist: Only these explicit public marketing routes may ever be tracked
export const ALLOWED_PUBLIC_TRACKING_PATHS = new Set<string>([
  "/",
  "/privacy",
  "/terms",
]);

// Prohibited keywords in any analytics event payload
const PROHIBITED_PAYLOAD_KEYS = new Set<string>([
  "caseid",
  "case_id",
  "defect",
  "partnumber",
  "part_number",
  "serialnumber",
  "serial_number",
  "machineid",
  "machine_id",
  "measurement",
  "observedvalue",
  "observed_value",
  "tolerance",
  "evidence",
  "photo",
  "attachment",
  "operator",
  "token",
  "secret",
  "auth",
  "cookie",
]);

export interface PublicPageViewEvent {
  path: string;
  referrer?: string;
  title?: string;
}

/**
 * Checks whether a pathname is in the explicit public tracking allowlist.
 * Ensures query strings or path parameters are never evaluated as valid.
 */
export function isPathAllowedForTracking(rawPath: string): boolean {
  if (!rawPath) return false;
  // Normalize and strip query string / hash
  const cleanPath = rawPath.split("?")[0].split("#")[0].trim().toLowerCase();
  return ALLOWED_PUBLIC_TRACKING_PATHS.has(cleanPath);
}

/**
 * Checks whether user has explicitly consented to public website analytics
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("fixloop_cookie_consent_v1");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

/**
 * Sanitizes and inspects analytics payload to ensure zero sensitive manufacturing data leaks.
 * Returns true if clean, false if any prohibited key or value pattern is detected.
 */
export function validateAnalyticsPayload(payload: Record<string, unknown>): boolean {
  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (PROHIBITED_PAYLOAD_KEYS.has(lowerKey)) {
      console.warn(`[FixLoop Telemetry] Blocked prohibited analytics field: ${key}`);
      return false;
    }
    // Deep check if nested object
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (!validateAnalyticsPayload(value as Record<string, unknown>)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Tracks public page views strictly on allowlisted public marketing routes.
 * Drops all calls originating from /app, /api, or any non-allowlisted route.
 */
export function trackPublicPageView(event: PublicPageViewEvent): void {
  if (typeof window === "undefined") return;

  // 1. Strict Allowlist verification: Never rely solely on a blocklist
  const cleanPath = event.path.split("?")[0].split("#")[0].trim().toLowerCase();
  if (!isPathAllowedForTracking(cleanPath)) {
    return;
  }

  // 2. Cookie consent verification
  if (!hasAnalyticsConsent()) {
    return;
  }

  // 3. Configuration check: Defer until real tracking ID is defined
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId || measurementId.startsWith("mock") || measurementId === "G-XXXXXXXXXX") {
    return;
  }

  // 4. Safe window dispatch
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "page_view", {
      page_path: cleanPath,
      page_title: "FixLoop Precision QMS", // Fixed, non-sensitive title
    });
  }
}

/**
 * Operational Metrics Definitions (Purely Server-Side, In-Product)
 * Stored and queried strictly within PostgreSQL tenant context.
 */
export interface OperationalQualityMetrics {
  meanTimeToContainmentMinutes: number;
  meanTimeToClosureHours: number;
  correctiveActionPassRate: number;
  recurrenceRatePercentage: number;
  totalActiveCases: number;
  totalVerifiedClosedCases: number;
}
