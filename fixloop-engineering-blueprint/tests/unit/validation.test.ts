import { describe, it, expect } from "vitest";
import { CreateCaseSchema, TriageCaseSchema, CloseCaseSchema } from "@/lib/validation/case";
import { CreateActionSchema, CompleteActionSchema } from "@/lib/validation/action";
import { CreateEffectivenessCheckSchema } from "@/lib/validation/verification";

describe("Validation Schemas Unit Tests", () => {
  describe("CreateCaseSchema", () => {
    it("accepts valid case intake", () => {
      const valid = {
        siteId: "site-123",
        title: "Defective flange weld",
        description: "Excessive weld spatter observed on line 3",
        severity: "HIGH",
        quantityInspected: 100,
        quantityAffected: 12,
      };
      const result = CreateCaseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects when quantity affected exceeds quantity inspected", () => {
      const invalid = {
        siteId: "site-123",
        title: "Defective flange weld",
        description: "Excessive weld spatter observed on line 3",
        quantityInspected: 10,
        quantityAffected: 50,
      };
      const result = CreateCaseSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("Quantity affected cannot exceed quantity inspected");
      }
    });

    it("rejects short title or description", () => {
      const invalid = {
        siteId: "site-123",
        title: "W",
        description: "short",
      };
      const result = CreateCaseSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("TriageCaseSchema", () => {
    it("validates severity, category and containment assessment", () => {
      const valid = {
        severity: "CRITICAL",
        category: "DIMENSIONAL",
        containmentAssessment: "Quarantine lot 409 and pause line 3 feed",
      };
      const result = TriageCaseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty containment assessment", () => {
      const invalid = {
        severity: "CRITICAL",
        category: "DIMENSIONAL",
        containmentAssessment: "",
      };
      const result = TriageCaseSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Action Validation", () => {
    it("validates action creation payload", () => {
      const valid = {
        actionType: "CONTAINMENT",
        description: "Inspect remaining 50 units in transit",
        assigneeId: "user-456",
        dueAt: new Date(Date.now() + 86400000).toISOString(),
      };
      const result = CreateActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("requires completion note when completing an action", () => {
      const invalid = {
        expectedVersion: 1,
        completionNote: "",
      };
      const result = CompleteActionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Effectiveness Check Validation", () => {
    it("rejects outOfToleranceCount greater than sampleSize", () => {
      const invalid = {
        criterion: "Zero porosity on 30 sample parts",
        sampleSize: 30,
        outOfToleranceCount: 45,
        outcome: "EFFECTIVE",
      };
      const result = CreateEffectivenessCheckSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
