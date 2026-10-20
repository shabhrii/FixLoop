# Case components

- `case-intake-form`: operator capture including part/machine, defect description, quantities, readings and evidence links; never trusts client-supplied actor/tenant IDs.
- `evidence-uploader`: upload-intent → direct private object upload → finalize; only finalized evidence may support a claim.
- `case-status-badge`: visible status label, color is never the only signal.
- `finding-editor`: types a statement as FACT_CANDIDATE, HYPOTHESIS, TESTED or CONFIRMED; confirmation is a separate server command with evidence/rationale.
- `five-why-editor`: ordered causal chain, each step may link evidence; blank steps cannot be silently auto-filled.
- `ai-suggestion-panel`: visibly labels output as a suggestion; user accepts, edits or rejects; no inferred acceptance.
- `audit-timeline`: read-only event timeline filtered by server permission.
