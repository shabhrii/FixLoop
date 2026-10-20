# Roles and permissions

## MVP roles

| Capability | Tenant Admin | Operator | Quality Engineer | Action Owner | Auditor/Viewer |
|---|---:|---:|---:|---:|---:|
| View authorized tenant workspace | Yes | Yes | Yes | Yes | Yes |
| Create defect case | Yes | Yes | Yes | Optional by policy | No |
| Edit own unsubmitted draft | Yes | Yes | Yes | No | No |
| Triage/classify/assign | No by default | No | Yes | No | Read only |
| Edit 5-Why/findings | No by default | No | Yes | No | Read only |
| Confirm cause | No by default | No | Yes + evidence/rationale | No | No |
| Create/assign actions | No by default | No | Yes | No | No |
| Complete assigned action/upload proof | No | No | Yes | Yes, assigned only | No |
| Decide effectiveness | No by default | No | Yes | No | No |
| Close/reopen case | No by default | No | Yes, with guards/reason | No | No |
| Manage members/sites | Yes | No | No | No | No |
| Search closed-case library | Yes | Limited | Yes | Read-limited | Read-limited |
| Export PDF | Yes | No by default | Yes | No by default | Optional policy |
| View case audit timeline | Admin summary | Own/relevant | Case-level | Assigned-action-level | Read-only by policy |

## Rules

1. Role lives on a tenant Membership, not globally on a user. MVP uses one role per membership; add explicit role assignments if real customers need combined roles.
2. Identity comes from the verified server session; request `userId` is never the actor.
3. Resolve active membership per request and check both capability and object relationship.
4. An Action Owner may mutate only actions assigned to them. Every child object is rechecked against tenant and case.
5. Use generic 404 for cross-tenant object lookups to reduce existence disclosure.
6. UI gating is cosmetic; direct API requests must enforce all rules.

## Separation of duties

Record reporter, investigator, action completer and reviewer. Recommended default: a reviewer should not verify their own completed action when another qualified reviewer is available. If a very small shop cannot separate roles, require a documented exception and preserve the true actor history rather than implying independent review.
