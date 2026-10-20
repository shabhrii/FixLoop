# Case evidence upload-intent API family

This directory groups the case-level upload-intent route. Create an evidence row in a pending state, generate a private opaque storage key and short-lived capability, then require a separate finalize step. Do not accept public URLs or client-chosen object keys. The actual evidence finalization/download endpoints are separately scoped under the tenant evidence route family.
