# High-value test inventory

| ID | Scenario | Expected |
|---|---|---|
| SEC-001 | Tenant A requests tenant B case | 404; no private fields |
| SEC-002 | Tenant A asks for B evidence URL | Denied; no URL |
| SEC-003 | Operator PATCHes status=CLOSED | Rejected, status unchanged |
| SEC-004 | Body substitutes user/role/tenant | Session + membership remain authoritative |
| SEC-005 | Action Owner completes another user's action | Denied |
| WF-001 | Close with incomplete required action | Blocked with reason |
| WF-002 | Close completed action without proof | Blocked absent audited waiver |
| WF-003 | NOT_EFFECTIVE outcome | Case stays open / corrective work resumes |
| WF-004 | INCONCLUSIVE outcome | Case stays open |
| WF-005 | Stale version during close | 409; no close event |
| WF-006 | Audit insert fails during close | Whole transaction rolls back |
| EVI-001 | Executable bytes claim image MIME | Rejected/not AVAILABLE |
| EVI-002 | Uploaded object never finalized | Cannot be proof/report evidence |
| AI-001 | Model returns malformed/extra fields | INVALID_OUTPUT; no partial acceptance |
| AI-002 | Model proposes cause | AI_HYPOTHESIS only |
| AI-003 | Provider unavailable | Manual intake works |
| AI-004 | Prompt tells model to confirm cause | No API path for model to do that |
| REP-001 | Case changes after export | Prior PDF immutable; new export has new snapshot |
| REP-002 | Unaccepted hypothesis printed as confirmed cause | Test fails |
| JOB-001 | Same report job runs twice | Idempotent result, no duplicate mutations |
| SRCH-001 | Query matches tenant B only | No result/count/facet leakage |
