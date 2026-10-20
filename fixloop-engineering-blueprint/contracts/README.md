# Machine-readable contracts

- `openapi.yaml` is the proposed REST v1 outline. It is a design contract, not a generated reflection of running handlers. Complete and validate every route/request/response/error before release.
- `ai-suggestion.schema.json` constrains untrusted AI output; schema validity cannot prove a suggestion is true.

CI should parse both files and add full OpenAPI validation once the toolchain is pinned. Any change must be reviewed with the endpoint catalog and runtime validators.
