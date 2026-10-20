# Report rendering

`render-case-pdf.tsx` renders a stable, versioned case snapshot using approved fields only. Distinguish confirmed findings from hypotheses and include actor/timestamps for decisions. Capture snapshot version and checksum, store PDF privately, and ensure authorized re-generation does not rewrite historical audit records. Avoid rendering raw HTML from notes; escape/sanitize user content.
