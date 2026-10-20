import { DomainError } from "@/lib/errors/domain-error";

export interface SpamProtectionOptions {
  honeypot?: string | null;
  turnstileToken?: string | null;
  minDurationSeconds?: number;
  submittedAtTimestamp?: number;
}

export interface VerificationResult {
  isSpam: boolean;
  reason?: string;
}

/**
 * Validates form submission against honeypot traps and external captcha / turnstile tokens
 */
export async function verifySpamProtection(options: SpamProtectionOptions): Promise<VerificationResult> {
  // 1. Honeypot check: Bots routinely fill all available inputs
  if (options.honeypot && options.honeypot.trim().length > 0) {
    return {
      isSpam: true,
      reason: "Honeypot field triggered by automated client.",
    };
  }

  // 2. Submission speed check: Automated headless scripts submit in milliseconds
  if (options.submittedAtTimestamp && options.minDurationSeconds) {
    const elapsedSeconds = (Date.now() - options.submittedAtTimestamp) / 1000;
    if (elapsedSeconds < options.minDurationSeconds) {
      return {
        isSpam: true,
        reason: `Form submitted unnaturally quickly (${elapsedSeconds.toFixed(2)}s). Minimum expected: ${options.minDurationSeconds}s.`,
      };
    }
  }

  // 3. Cloudflare Turnstile validation (if configured with secret key)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && options.turnstileToken) {
    try {
      const formData = new URLSearchParams();
      formData.append("secret", turnstileSecret);
      formData.append("response", options.turnstileToken);

      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
      });

      const outcome = await res.json();
      if (!outcome.success) {
        return {
          isSpam: true,
          reason: `Turnstile challenge verification failed: ${outcome["error-codes"]?.join(", ") || "invalid token"}`,
        };
      }
    } catch (err) {
      // In case of challenge endpoint network timeout, log safe error without leaking secret
      console.error("[SpamProtection] Cloudflare Turnstile verification error");
    }
  }

  return { isSpam: false };
}

/**
 * Asserts that the request does not exhibit spam characteristics, throwing DomainError if it fails.
 */
export async function assertHumanSubmission(options: SpamProtectionOptions): Promise<void> {
  const result = await verifySpamProtection(options);
  if (result.isSpam) {
    throw DomainError.validation(result.reason || "Automated submission rejected.");
  }
}
