# Pure domain policies

`case-policy.ts` contains deterministic functions such as `canTransition`, `canSubmit`, `canClose` and role-to-capability mapping. Functions return explicit allowed/blocked results with reason codes. They take persisted domain facts and trusted role context; they do not call databases, the clock, LLMs or storage. Unit-test every state edge, including forbidden edges.
