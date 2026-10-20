# Report components

`report-export-button` requests an idempotent report for a specific case/version, displays QUEUED/PROCESSING/READY/FAILED, and obtains a short-lived authorized download URL only after READY. Do not generate the authoritative PDF entirely in the browser, expose storage keys, or let a report snapshot silently include unreviewed AI content.
