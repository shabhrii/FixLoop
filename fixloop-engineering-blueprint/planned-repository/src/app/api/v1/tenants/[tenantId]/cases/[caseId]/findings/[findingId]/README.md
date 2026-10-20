# Single-finding API family

This directory scopes operations on one finding under one case. First prove tenant membership, then verify finding→case and evidence→case relationships. The `confirm/route.ts` command is a human decision gate: require a quality role, rationale and available evidence, and persist confirmer/time/audit atomically.
