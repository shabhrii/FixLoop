# Integration tests

Run against disposable PostgreSQL using the same non-owner application role policy intended in production. Verify tenant A cannot read/write tenant B by API, ORM filters and RLS; case mutation + audit are atomic; close cannot succeed without effective review; private-storage downloads require fresh authorization; retries cannot duplicate side effects. A mock DB or mock authorization function alone is insufficient.
