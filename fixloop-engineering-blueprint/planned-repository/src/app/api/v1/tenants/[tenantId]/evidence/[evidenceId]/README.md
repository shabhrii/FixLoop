# Tenant evidence object operations

All object access goes through an authorized metadata record and its parent case. `finalize` verifies the uploaded object's actual metadata and marks it usable; `download` re-authorizes and returns a short-lived signed URL. Never trust a client-supplied evidence ID, tenant ID or storage path without resolving and checking database relationships.
