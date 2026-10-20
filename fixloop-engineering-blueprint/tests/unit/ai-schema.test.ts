import { describe, it, expect } from "vitest";
import { AiSuggestionOutputSchema } from "../../src/lib/validation/ai";
import { generateDeterministicMockSuggestion } from "../../src/lib/ai/mock-provider";

describe("AI Schema Strict Validation", () => {
  it("validates compliant output from mock provider", () => {
    const output = generateDeterministicMockSuggestion({
      title: "Spindle bearing vibration",
      description: "Excessive vibration detected on Lathe spindle bearing during roughing cycle.",
      category: "VIBRATION",
      observedValue: 4.8,
      unit: "mm/s",
      specification: "< 2.5 mm/s",
      machineId: "LATHE-01",
    });

    const parsed = AiSuggestionOutputSchema.safeParse(output);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.schemaVersion).toBe("1.0");
      expect(parsed.data.findings.length).toBeGreaterThan(0);
      expect(parsed.data.possibleCauses.length).toBeGreaterThan(0);
    }
  });

  it("REJECTS output missing required safety note or schemaVersion", () => {
    const invalidOutput: any = {
      schemaVersion: "2.0", // Invalid version
      titleSuggestion: "Invalid suggestion",
      categorySuggestion: "OTHER",
      summary: "Short summary",
      findings: [],
      possibleCauses: [],
      missingInformation: [],
      // Missing safetyNote
    };

    const parsed = AiSuggestionOutputSchema.safeParse(invalidOutput);
    expect(parsed.success).toBe(false);
  });

  it("REJECTS output with unrecognized categories", () => {
    const invalidOutput = {
      schemaVersion: "1.0",
      titleSuggestion: "Dev",
      categorySuggestion: "UNRECOGNIZED_CATEGORY" as any,
      summary: "Short summary",
      findings: [],
      possibleCauses: [],
      missingInformation: [],
      safetyNote: "Note",
    };

    const parsed = AiSuggestionOutputSchema.safeParse(invalidOutput);
    expect(parsed.success).toBe(false);
  });
});
