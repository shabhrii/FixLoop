# Unit tests

Pure tests for state transitions/closure guards, schema parsers, quantity invariants, error mapping and AI output bounds. For each policy, test allowed paths and each prohibited path. AI tests assert malformed, oversized, unsupported-category and evidence-ID spoof outputs are rejected. Tests must not call a live LLM.
