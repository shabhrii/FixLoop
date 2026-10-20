# Private storage adapter

Create server-generated opaque keys beneath tenant/site/case namespaces; never construct keys from raw user filenames. The bucket remains private. Use short-lived signed upload/download URLs, verify ownership and path at every operation, validate file size and allow-listed content types, verify actual object metadata during finalize, and store checksums. Failed or orphaned uploads have a retention/cleanup policy. Malware scanning is a deployment-dependent pilot gate for untrusted files.
