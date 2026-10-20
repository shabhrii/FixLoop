import { describe, it, expect } from "vitest";
import { checkRateLimit, extractClientIp } from "@/lib/security/rate-limiter";
import { verifySpamProtection } from "@/lib/security/spam-protection";
import { PrivateStorage } from "@/lib/storage/private-storage";
import { isPathAllowedForTracking, validateAnalyticsPayload } from "@/lib/telemetry/analytics";

describe("Security & Rate Limiting Tests", () => {
  describe("checkRateLimit", () => {
    it("allows requests under the rate limit", () => {
      const ip = "192.168.1.100";
      const res = checkRateLimit(ip, 5, 60);
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(4);
    });

    it("blocks requests once the rate limit is exceeded", () => {
      const ip = "10.0.0.99";
      // Exhaust 3 allowed requests
      checkRateLimit(ip, 3, 60);
      checkRateLimit(ip, 3, 60);
      checkRateLimit(ip, 3, 60);

      // 4th request must fail
      const blocked = checkRateLimit(ip, 3, 60);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetSeconds).toBeGreaterThan(0);
    });
  });

  describe("extractClientIp", () => {
    it("prefers cf-connecting-ip when present", () => {
      const mockReq = {
        headers: new Headers({
          "cf-connecting-ip": "203.0.113.195",
          "x-forwarded-for": "198.51.100.1, 192.0.2.1",
        }),
      } as any;
      expect(extractClientIp(mockReq)).toBe("203.0.113.195");
    });

    it("extracts leftmost client IP from x-forwarded-for chain", () => {
      const mockReq = {
        headers: new Headers({
          "x-forwarded-for": "198.51.100.42, 10.0.0.1",
        }),
      } as any;
      expect(extractClientIp(mockReq)).toBe("198.51.100.42");
    });
  });

  describe("verifySpamProtection", () => {
    it("flags honeypot filled submissions as spam", async () => {
      const res = await verifySpamProtection({ honeypot: "spam_link" });
      expect(res.isSpam).toBe(true);
      expect(res.reason).toContain("Honeypot");
    });

    it("passes clean submissions with empty honeypot", async () => {
      const res = await verifySpamProtection({ honeypot: "" });
      expect(res.isSpam).toBe(false);
    });

    it("flags unnaturally rapid submissions", async () => {
      const res = await verifySpamProtection({
        honeypot: "",
        submittedAtTimestamp: Date.now() - 100, // 100ms ago
        minDurationSeconds: 1.0,
      });
      expect(res.isSpam).toBe(true);
      expect(res.reason).toContain("unnaturally quickly");
    });
  });

  describe("PrivateStorage path traversal defense", () => {
    it("resolves valid nested object keys under storage root", () => {
      const safeKey = "tenants/t-1/cases/c-1/uuid.jpg";
      const resolved = PrivateStorage.resolveSafePath(safeKey);
      expect(resolved).toContain("local-evidence");
      expect(resolved).toContain(safeKey.replace(/\//g, "\\"));
    });

    it("throws error when path traversal is attempted", () => {
      const dangerousKey = "../../../etc/passwd";
      expect(() => PrivateStorage.resolveSafePath(dangerousKey)).toThrow("Path traversal forbidden");
    });
  });

  describe("Analytics & Telemetry Strict Isolation", () => {
    it("strictly allows only explicitly allowlisted public marketing paths", () => {
      expect(isPathAllowedForTracking("/")).toBe(true);
      expect(isPathAllowedForTracking("/privacy")).toBe(true);
      expect(isPathAllowedForTracking("/terms")).toBe(true);

      // Block all authenticated workspace routes, API endpoints, and arbitrary paths
      expect(isPathAllowedForTracking("/app")).toBe(false);
      expect(isPathAllowedForTracking("/app/cases")).toBe(false);
      expect(isPathAllowedForTracking("/app/cases/case-123")).toBe(false);
      expect(isPathAllowedForTracking("/cases")).toBe(false);
      expect(isPathAllowedForTracking("/api/v1/auth/login")).toBe(false);
      expect(isPathAllowedForTracking("/admin")).toBe(false);
    });

    it("strips query parameters before evaluating path allowlist", () => {
      // Query parameters like ?partNumber=PN-4091 or ?case=123 must be stripped
      expect(isPathAllowedForTracking("/privacy?query=param")).toBe(true);
      expect(isPathAllowedForTracking("/app/cases?caseId=case-99")).toBe(false);
    });

    it("blocks analytics payloads containing prohibited manufacturing or security fields", () => {
      expect(validateAnalyticsPayload({ page: "home", scroll: 50 })).toBe(true);

      // Defect parameters
      expect(validateAnalyticsPayload({ defect: "Bore undersized" })).toBe(false);
      expect(validateAnalyticsPayload({ partNumber: "PN-4091" })).toBe(false);
      expect(validateAnalyticsPayload({ machineId: "CNC-04" })).toBe(false);
      expect(validateAnalyticsPayload({ measurement: 45.02 })).toBe(false);
      expect(validateAnalyticsPayload({ caseId: "cmvg..." })).toBe(false);
      expect(validateAnalyticsPayload({ token: "jwt..." })).toBe(false);
    });
  });
});
