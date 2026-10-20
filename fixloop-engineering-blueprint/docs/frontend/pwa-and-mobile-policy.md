# PWA and mobile policy

## MVP promise
A responsive, phone-first installable web app. **Full offline case submission/synchronization is not promised in MVP.**

## Required
- Layout works at narrow shop-floor phone widths with touch-sized primary controls.
- Camera/photo selection works on supported browsers and upload failure is recoverable.
- Add manifest and public icons. Cache only safe app-shell assets; do not cache authenticated API results, case details, evidence bytes or signed URLs by default.
- Warn on connection loss/unsaved work. Do not persist sensitive offline drafts long-term until local encryption/retention/device-sharing/conflict policy is designed.
- Explain session expiration and don't silently retain unsent sensitive forms.

## Offline design needed before future implementation
Conflict via case version, retries/idempotency, local encryption/lock, expiration, logout wipe, evidence upload retry, clock skew, tenant switching, shared kiosk phones, and outdated verification. A service worker alone is not offline support.
