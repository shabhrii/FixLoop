# Test plan

## Unit tests
State transitions/`canClose`; role matrix; intake and AI schemas; sample/count validation; safe key/filename builder; report snapshot excludes unapproved AI fields; log redaction.

## Integration tests (PostgreSQL + RLS + test storage)
- concurrent case-number allocation;
- audit failure rolls back close/confirm/verification;
- tenant A/B read/write/search/evidence/report isolation;
- RLS using production-equivalent non-owner role and pooled connections;
- upload intent/finalize and unauthorized signed URL denial;
- version conflict behavior;
- failed/inconclusive check cannot close;
- effective check cannot close if required proof is missing;
- close/reopen actor/reason/version audit;
- worker retries and report checksum/version idempotency.

## E2E flow
1. Operator logs in, opens a case, attaches evidence and submits.
2. Quality Engineer triages, creates finding/5-Why, confirms a cause with evidence and assigns action.
3. Action Owner completes action and uploads proof.
4. Reviewer enters NOT_EFFECTIVE; case remains open and corrective work resumes.
5. Revised action gets proof; reviewer enters EFFECTIVE; case closes.
6. Case appears in search and PDF matches approved values.
7. A separate tenant cannot load case/evidence/report/search result.
8. AI disabled/provider down still permits manual workflow.

Use synthetic fixtures. The FB-204/VMC-03 example and 0/150 sample are illustrative only and must show DEMO. A green UI-only suite is insufficient; run direct API and DB/storage policy tests in staging.
