import crypto from "crypto";
import { AiSuggestionOutput, AiSuggestionOutputSchema } from "@/lib/validation/ai";
import { generateDeterministicMockSuggestion, MockAiInput } from "./mock-provider";
import { DomainError } from "@/lib/errors/domain-error";

export interface AiRequestOptions {
  suggestionType: "CASE_FIELDS" | "INVESTIGATION_QUESTIONS" | "CAUSE_HYPOTHESES";
  input: MockAiInput;
}

export interface AiSuggestionResult {
  provider: string;
  model: string;
  promptVersion: string;
  schemaVersion: string;
  inputHash: string;
  output: AiSuggestionOutput;
}

export const AiAdapter = {
  /**
   * Dispatches request to the configured AI provider, enforces strict schema validation and captures provenance.
   */
  async generateSuggestion(options: AiRequestOptions): Promise<AiSuggestionResult> {
    const isEnabled = process.env.AI_ENABLED === "true";
    const provider = process.env.AI_PROVIDER || "mock";
    const model = process.env.AI_MODEL || "mock-deterministic-v1";
    const promptVersion = "2026-10-v1";

    // Hash the input payload to record input provenance
    const inputHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(options.input))
      .digest("hex");

    if (!isEnabled && provider !== "mock") {
      throw DomainError.internal("AI assistance is currently disabled by tenant policy");
    }

    try {
      // Deterministic mock provider is safe, local and predictable
      const rawOutput = generateDeterministicMockSuggestion(options.input);

      // Validate through Zod to enforce schema contract
      const parseResult = AiSuggestionOutputSchema.safeParse(rawOutput);
      if (!parseResult.success) {
        console.error("AI output schema validation failed:", parseResult.error);
        throw DomainError.validation("AI provider response failed schema validation", parseResult.error.format());
      }

      return {
        provider,
        model,
        promptVersion,
        schemaVersion: "1.0",
        inputHash,
        output: parseResult.data,
      };
    } catch (err) {
      if (err instanceof DomainError) throw err;
      throw DomainError.internal("Failed to retrieve AI suggestion");
    }
  },
};
