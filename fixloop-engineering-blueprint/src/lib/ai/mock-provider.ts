import { AiSuggestionOutput } from "@/lib/validation/ai";

export interface MockAiInput {
  title: string;
  description: string;
  category?: string | null;
  observedValue?: number | null;
  unit?: string | null;
  specification?: string | null;
  machineId?: string | null;
  operation?: string | null;
}

export function generateDeterministicMockSuggestion(input: MockAiInput): AiSuggestionOutput {
  const isDimensional =
    input.observedValue != null ||
    (input.category && input.category.toLowerCase().includes("dimension")) ||
    input.description.toLowerCase().includes("bore") ||
    input.description.toLowerCase().includes("diameter") ||
    input.description.toLowerCase().includes("length");

  return {
    schemaVersion: "1.0",
    titleSuggestion: input.title ? `[Draft] ${input.title}` : "Suspected machining deviation",
    categorySuggestion: isDimensional ? "DIMENSIONAL" : "PROCESS",
    summary: `Automated intake analysis: observed deviation in ${input.operation || "operation"} on ${
      input.machineId || "machine"
    }. Evidence suggests tool wear or thermal expansion may be contributing factors.`,
    findings: [
      {
        statement: `Observed reading (${input.observedValue ?? "N/A"} ${input.unit ?? ""}) exceeds specification (${
          input.specification ?? "nominal"
        }).`,
        kind: "FACT_CANDIDATE",
        sourceEvidenceIds: [],
        confidenceBand: "HIGH",
      },
      {
        statement: "Tool insert insert wear or spindle runout during finish cut may have altered cutting diameter.",
        kind: "HYPOTHESIS",
        sourceEvidenceIds: [],
        confidenceBand: "MEDIUM",
      },
    ],
    possibleCauses: [
      {
        statement: "Insert flank wear exceeding 0.3mm leading to tool deflection under cutting pressure.",
        testToRun: "Inspect cutting edge with optical microscope and measure spindle runout using dial indicator.",
        sourceEvidenceIds: [],
      },
      {
        statement: "Thermal expansion of workpiece during uncooled semi-finish pass.",
        testToRun: "Verify coolant concentration and temperature at delivery nozzle.",
        sourceEvidenceIds: [],
      },
    ],
    missingInformation: [
      "Confirm insert corner radius and cutting hours since last edge replacement.",
      "Record coolant refractometer reading at time of batch inspection.",
    ],
    safetyNote:
      "AI suggestions are unverified initial hypotheses. A qualified Quality Engineer must evaluate physical parts and verify measurements before confirming any cause.",
  };
}
