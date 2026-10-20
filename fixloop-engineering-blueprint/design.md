# FixLoop Frontend Design Specification (`design.md`)

**Status:** Frontend design direction and implementation contract\
**Product:** FixLoop --- evidence-backed defect investigation and
corrective-action verification\
**Reference:** User-provided website screenshot (white canvas, pale
blue-gray hero, deep blue abstract forms, rounded blue CTAs, spacious
editorial layout, split information panels).\
**Scope:** Frontend only. This document defines visual language, layout,
components, responsive behavior, accessibility, and interaction states.
It does not replace product requirements, backend contracts,
authorization policies, or the existing case state machine.

------------------------------------------------------------------------

## 1. Design intent

Use the reference image as a **visual language reference**, not as a
literal page template. Its useful characteristics are:

-   Bright white surfaces with generous whitespace.
-   Pale blue-gray backgrounds for major feature areas.
-   Deep, restrained blue for primary actions and emphasis.
-   Large, confident typography and clear heading hierarchy.
-   Rounded, pill-shaped primary buttons.
-   Softly rounded panels and restrained shadows.
-   Editorial, asymmetric layouts that feel composed rather than like a
    generic admin dashboard.
-   Large abstract imagery used sparingly to establish brand identity.

Translate those characteristics into a credible manufacturing-quality
product. Do **not** reproduce the reference's unrelated navigation
labels, nonsensical placeholder copy, decorative product imagery, or
marketing-only section order inside the authenticated application.

FixLoop is a working shop-floor tool. Visual polish must never make
defect reporting, evidence review, action ownership, or effectiveness
verification harder to find or use.

### Design principles

1.  **Workflow first:** the current case stage and the next required
    action are always obvious.
2.  **Evidence before assertion:** facts, AI hypotheses, tested
    hypotheses, and human-confirmed causes have visibly distinct
    treatments.
3.  **Quiet confidence:** use blue and neutral surfaces; avoid excessive
    gradients, neon colors, decorative motion, and dashboard clutter.
4.  **Mobile-first utility:** critical actions work comfortably on
    phones and tablets used on a factory floor.
5.  **Readable under pressure:** strong contrast, short labels,
    predictable controls, and visible validation.
6.  **Progressive disclosure:** expose essential information first;
    place advanced details and audit history in secondary sections.
7.  **Trust through clarity:** show who owns an action, its due date,
    its evidence status, and who approved closure.
8.  **No fake functionality:** every visible interactive control must
    have a real behavior or be clearly disabled with an explanation.

------------------------------------------------------------------------

## 2. Two related frontend surfaces

Keep the public website and authenticated product visually related but
functionally distinct.

### 2.1 Public website

Purpose: explain FixLoop, communicate its workflow and benefits, and let
a factory owner request a demo or sign in.

Use more of the reference screenshot's editorial composition:

-   White navigation bar with FixLoop wordmark.
-   Spacious hero with a pale blue-gray field and a single abstract blue
    visual.
-   Clear headline, short supporting paragraph, and one dominant CTA.
-   Two or three concise capability highlights.
-   A workflow section explaining Report → Triage → Investigate → Act →
    Verify → Close.
-   A feature panel with a dark or deep-blue accent block, used
    sparingly.
-   A clear final CTA and restrained footer.

Recommended headline direction: **"Turn defects into verified fixes."**\
Supporting message: "Capture evidence, investigate causes, assign
corrective actions, and verify that the fix worked."

Primary CTA: **Request a demo** (if a real demo-request flow exists).\
Secondary CTA: **Sign in**.

Do not display unsupported customer logos, testimonials, quantified
savings, quality claims, or regulatory certifications. If the
demo-request feature does not exist yet, use a configured contact path
rather than a dead CTA.

### 2.2 Authenticated application

Purpose: let operators and quality teams complete quality workflows
reliably.

Retain the same palette, typography, spacing discipline, and rounded
controls, but use a more compact and information-dense layout than the
public website.

-   White or very pale neutral application surfaces.
-   Deep-blue primary actions.
-   Light blue-gray grouping surfaces.
-   Cards and panels with subtle borders.
-   Consistent status chips and form controls.
-   Minimal decorative artwork.
-   Clear page titles, breadcrumbs where useful, and a persistent sense
    of workspace/context.
-   Mobile bottom navigation only where it improves access to the core
    workflow; avoid duplicating navigation unnecessarily on larger
    screens.

The authenticated app must not look like a long marketing landing page.
Do not place oversized decorative hero sections above the operator's
active queue or current case.

------------------------------------------------------------------------

## 3. Color system

Use the following as initial design tokens. Validate all
foreground/background combinations in implementation; do not assume
contrast passes merely because the colors look legible in a screenshot.

  -----------------------------------------------------------------------
  Token                   Suggested value         Usage
  ----------------------- ----------------------- -----------------------
  `--fl-blue-900`         `#17365A`               Dark blue emphasis,
                                                  selected navigation,
                                                  strong accent

  `--fl-blue-800`         `#214B78`               Primary button
                                                  hover/active states

  `--fl-blue-700`         `#2F5F91`               Primary actions and
                                                  links

  `--fl-blue-600`         `#3E74A8`               Secondary blue
                                                  emphasis; verify
                                                  contrast per use

  `--fl-blue-100`         `#E7EFF7`               Selected states and
                                                  soft blue surfaces

  `--fl-blue-050`         `#F3F7FB`               Hero and feature
                                                  background

  `--fl-page`             `#FFFFFF`               Main page background

  `--fl-surface`          `#FFFFFF`               Cards and forms

  `--fl-surface-muted`    `#F7F9FC`               Secondary panel
                                                  background

  `--fl-border`           `#D8E0E9`               Dividers, card
                                                  outlines, input borders

  `--fl-text`             `#17212F`               Main text

  `--fl-text-muted`       `#526173`               Secondary text;
                                                  validate contrast

  `--fl-success`          `#216E4A`               Successful verification
                                                  and completed states

  `--fl-warning`          `#8A5700`               Due-soon or caution
                                                  states

  `--fl-danger`           `#B42318`               Errors, rejected
                                                  verification,
                                                  destructive actions

  `--fl-info`             `#245B86`               Neutral information
                                                  states
  -----------------------------------------------------------------------

### Color rules

-   Blue is the primary brand and action color, not a universal status
    color.
-   Never communicate status using color alone. Include text and, where
    helpful, an icon.
-   Success green means a verified successful state; it must not merely
    mean "form submitted."
-   Warning and danger colors must remain readable against their actual
    surfaces.
-   Use gradients only for optional public-facing artwork, not behind
    data tables or critical forms.
-   Avoid large black panels as a default. Deep blue is the preferred
    brand anchor.

------------------------------------------------------------------------

## 4. Typography

Use the repository's existing font if one is already consistently
configured. Otherwise use a modern sans-serif stack such as `Inter`,
with system sans-serif fallbacks. Do not add a remote font dependency
solely for visual similarity.

### Type scale

  --------------------------------------------------------------------------------
  Token                   Desktop guidance                 Usage
  ----------------------- -------------------------------- -----------------------
  Display                 `clamp(2.25rem, 4vw, 3.75rem)`   Public hero headline
                                                           only

  H1                      `2rem–2.5rem`                    Main page title or case
                                                           title

  H2                      `1.5rem–1.875rem`                Major page section

  H3                      `1.125rem–1.375rem`              Cards and subsections

  Body                    `1rem`                           Main content

  Small                   `0.875rem`                       Supporting text and
                                                           metadata

  Caption                 `0.75rem–0.8125rem`              Secondary metadata
                                                           only; never critical
                                                           instructions
  --------------------------------------------------------------------------------

-   Body line-height: approximately `1.5`.
-   Headings: approximately `1.15–1.25`.
-   Keep paragraph widths comfortable; avoid long full-screen lines.
-   Use tabular numerals for measurements, counts, dates, and case
    identifiers where useful.
-   Avoid tiny uppercase labels for essential status information.
-   Do not use blurred, stylized, or distorted typography like the
    illegible placeholder text in the reference image.

------------------------------------------------------------------------

## 5. Layout, spacing, and geometry

Use a consistent spacing scale based on 4 px:

`4, 8, 12, 16, 24, 32, 48, 64, 80 px`

### Public website

-   Maximum content width: approximately `1160–1240 px`.
-   Horizontal gutters: `24–32 px` desktop; `16–20 px` mobile.
-   Hero: two-column layout on wide screens, stacked on small screens.
-   Feature sections: alternate simple text/image or text/panel
    compositions.
-   Use whitespace deliberately, but keep the key value proposition and
    CTA visible without excessive scrolling.
-   Keep abstract art decorative and non-interactive.

### Authenticated application

-   Main content max width: typically `1280–1440 px` where data-heavy
    screens need it.
-   Standard page padding: `24–32 px` desktop; `16 px` mobile.
-   Card padding: `20–24 px` desktop; `16 px` mobile.
-   Form field spacing: `16–20 px`.
-   Section spacing: `24–32 px`.
-   Dense data views may use less spacing, but must remain readable and
    touch-friendly.
-   Keep primary page actions in a predictable location; on long forms,
    use a clear sticky action area only if it does not obscure content
    or keyboard focus.

### Corners and shadows

-   Small controls: `8–10 px` radius.
-   Cards and panels: `12–16 px` radius.
-   Primary public CTA: pill shape is acceptable.
-   In-app buttons may use moderately rounded corners rather than pills
    if this improves density and consistency.
-   Use subtle borders before shadows. Avoid large, diffuse shadows
    around every panel.

------------------------------------------------------------------------

## 6. Navigation

### Public navigation

Desktop: - FixLoop wordmark on the left. - A small number of real
destinations, such as Product, Workflow, Security/Privacy, and
Contact. - Sign in as a secondary action. - Request a demo as the
primary action if implemented.

Mobile: - Wordmark and a compact accessible menu control. - Menu items
remain keyboard-accessible and screen-reader understandable. - Do not
force desktop navigation into a tiny horizontal row.

### Application navigation

Use existing routes and role rules. Do not invent destinations or imply
permissions that the backend does not grant.

Potential information architecture, subject to the existing
repository: - Overview / active queue. - Cases. - Actions assigned to
me. - Case library. - Administration (authorized roles only).

On mobile, consider a bottom navigation bar for the most frequent
destinations and a clearly visible "Report defect" action. Keep
secondary links in an accessible menu.

Navigation visibility is a usability choice, **not authorization**.
Every protected route, API operation, server action, and resource must
still enforce authentication and permissions server-side.

Show current workspace/factory context where appropriate, but do not
expose other tenants' names or records in navigation or selectors.

------------------------------------------------------------------------

## 7. Core screen specifications

Implement these designs using the existing routes and component
structure. Treat the list as screen requirements, not permission to
create duplicate routes.

### 7.1 Active queue / overview

Purpose: help each role identify the next useful action quickly.

Layout: - Compact page title and workspace context. - One primary CTA
for reporting a defect, when the current role is permitted. - Small
summary cards only for meaningful metrics. - Clear filters and search. -
Case list/table with case reference, defect title, stage,
severity/priority if supported, owner, due date, and last update. -
Visually distinct overdue and blocked states. - Empty state with a real
next action. - Loading skeletons that resemble the final content layout.

Mobile: - Convert wide rows into stacked case cards. - Keep the title,
stage, and next action visible. - Move less-used metadata into a
secondary row or expandable detail. - Avoid horizontal scrolling for the
main workflow.

Do not invent metrics or show fabricated demo counts in production.

### 7.2 Report defect

The form should feel quick and guided, not like a large administrative
data-entry page.

Suggested groups: 1. Part/product and relevant identifier. 2. Machine or
work cell, when applicable. 3. Defect description. 4. Measurement and
tolerance, when applicable. 5. Quantity inspected and quantity affected,
when applicable. 6. Photo or supporting evidence. 7. Submit and review.

Rules: - Show required fields clearly. - Use appropriate input types and
units. - Preserve user-entered data if a submission fails. - Show upload
progress, retry, and clear failure messages. - Explain file constraints
before or at upload. - Provide a visible preview and remove/replace
control for selected evidence. - If AI suggests a title or category,
label it as a suggestion and require the reporter to accept or edit
it. - Do not silently convert AI-generated content into a confirmed
fact. - Avoid placing a large AI panel above the core form.

### 7.3 Triage

-   Show the original report and attached evidence prominently.
-   Keep classification, priority, assignment, and disposition controls
    grouped.
-   Show the current case stage and who is responsible for the next
    action.
-   Require confirmation for consequential state changes.
-   Explain why a transition is unavailable instead of showing an
    unexplained disabled button.
-   Preserve the original report and record relevant changes in the
    audit trail.

### 7.4 Investigation and 5-Why analysis

Use a readable vertical sequence of linked investigation steps.

Each entry should distinguish: - Question or why-step. - Recorded
answer. - Evidence reference. - Classification: fact, hypothesis, tested
hypothesis, or confirmed cause. - Author and timestamp where
appropriate.

Visual treatments: - **Fact:** neutral blue-gray panel with a clear
"Fact" label. - **AI hypothesis:** muted blue panel with an explicit "AI
hypothesis --- unconfirmed" label. - **Tested hypothesis:** neutral
panel indicating the test and its outcome. - **Confirmed cause:**
distinct success-accented panel only after an authorized human confirms
it with supporting evidence.

Do not rely on blue/green alone. Use visible labels and appropriate
icons/text.

AI suggestions should be visually secondary to evidence and editable by
authorized users. Do not present an AI conclusion as the root cause by
default.

### 7.5 Corrective actions

Display each action as a focused card or structured row containing: -
Action title and description. - Owner. - Due date. - Status. - Required
proof. - Submitted evidence. - Completion timestamp and actor when
available.

Show overdue actions clearly without overwhelming the screen with red.

Allow authorized owners to submit proof and reviewers to inspect it. A
submitted action is not necessarily an effective correction and must not
automatically close the case.

Prevent accidental duplicate submission on repeated clicks or network
retries.

### 7.6 Effectiveness verification

This screen is a core differentiator and must receive special attention.

Present: - The corrective action being evaluated. - The verification
plan and acceptance criteria. - Sample/lot or observation details where
relevant. - Actual results and evidence. - Reviewer identity and
decision. - Decision timestamp and rationale.

Possible outcomes: - Effective --- reviewer confirms that defined
criteria were met. - Ineffective --- case remains open or reopens
according to the existing state machine. - Incomplete --- required
evidence or observations are missing.

Do not use a generic "Done" button as a substitute for verification.
Show a clear summary of the evidence used to make the decision.

Do not impose a universal sample size or statistical threshold unless
the product's requirements explicitly define one.

### 7.7 Case detail and closure

Use a structured detail layout: - Case identity and current stage. - Key
facts and impact. - Evidence. - Investigation. - Corrective actions. -
Verification results. - Audit timeline.

Closure action must be available only when the existing
server-authoritative policy permits it. The UI should explain missing
requirements, but the backend remains authoritative.

After closure, display the reviewer decision and verification outcome
prominently. Provide an authorized PDF export action if implemented.

### 7.8 Searchable case library

-   Search by supported, authorized fields.
-   Provide filters for useful classifications and outcomes.
-   Make closed-case summaries scannable.
-   Show verified cause and corrective action only when supported by the
    record.
-   Respect tenant boundaries and existing access permissions.
-   Use an honest empty state and clear "no results" state.
-   Do not expose confidential data through autocomplete, search
    suggestions, URL parameters, or analytics.

### 7.9 Administration

Keep administrative screens visually consistent but clearly separated
from normal operator workflows.

-   Use explicit role and permission labels.
-   Confirm destructive or high-impact actions.
-   Avoid exposing secrets in forms or logs.
-   Keep tenant configuration and user management scoped to authorized
    administrators.
-   Do not rely on hiding an admin navigation item as the security
    control.

------------------------------------------------------------------------

## 8. Component design contract

Prefer existing components and design-system conventions. Reuse
components rather than creating slightly different versions on each
page.

Core component families:

-   `Button`: primary, secondary, outline, ghost, destructive, loading,
    disabled.
-   `Input`, `Textarea`, `Select`, `DatePicker`, measurement inputs.
-   `FormField`: label, required indicator, help text, error message.
-   `Card`, `Panel`, `SectionHeader`.
-   `StatusBadge`: text plus optional icon; never color-only.
-   `WorkflowStepper`: the six stages with current, completed, blocked,
    and future states.
-   `EvidenceList` / `EvidencePreview`: authorized previews and download
    controls.
-   `FactLabel`: fact, AI hypothesis, tested, confirmed.
-   `ActionCard`: owner, due date, status, proof.
-   `VerificationSummary`: criteria, results, reviewer, decision.
-   `AuditTimeline`: actor, event, timestamp, relevant change.
-   `EmptyState`, `LoadingState`, `ErrorState`.
-   `ConfirmDialog` for consequential actions.
-   `Toast` or inline status messages for operation feedback.

For each component, define: - Purpose and permitted contexts. -
Props/types. - Loading, error, disabled, and empty behavior. - Keyboard
and screen-reader behavior. - Responsive behavior.

Do not introduce a new UI framework or icon library if the repository
already has a suitable one. Use the project's existing icon conventions
consistently.

------------------------------------------------------------------------

## 9. Interaction states and feedback

Every asynchronous operation must have a defined state.

### Required states

-   Initial/loading.
-   Ready.
-   Submitting.
-   Success.
-   Validation failure.
-   Authorization failure.
-   Network/server failure.
-   Empty result.
-   Retryable failure.
-   Irrecoverable failure or unavailable action.

### Rules

-   Disable duplicate submission while a mutation is in progress.
-   Preserve form values after recoverable errors.
-   Use inline validation near the relevant field.
-   Provide a concise summary for forms with multiple errors.
-   Do not show success before the server confirms success.
-   Use confirmation for destructive operations and irreversible
    transitions.
-   Avoid modal dialogs for routine actions.
-   Respect `prefers-reduced-motion`.
-   Never communicate a backend authorization denial only by hiding the
    UI control.
-   Do not display fabricated progress or success messages.

------------------------------------------------------------------------

## 10. Accessibility requirements

Target WCAG 2.2 AA for the implemented interface, while documenting any
exceptions.

-   Validate text contrast and non-text control contrast.
-   Maintain visible keyboard focus.
-   Use semantic HTML and accessible names.
-   Ensure every form field has a programmatic label.
-   Associate validation errors with their fields.
-   Announce important asynchronous updates appropriately.
-   Ensure dialogs manage focus correctly and return focus after
    closing.
-   Do not rely on color, hover, or icon shape alone.
-   Support browser zoom and text resizing.
-   Avoid fixed-height content that clips enlarged text.
-   Ensure mobile targets are comfortably touchable; use approximately
    44 × 44 CSS pixels as a practical design target where feasible.
-   Keep the keyboard from obscuring the active field or primary action.
-   Test the complete critical workflow with keyboard-only navigation.

------------------------------------------------------------------------

## 11. Responsive breakpoints

Use the existing Tailwind configuration or project conventions if
present. If there is no established system, start with:

-   Small: `< 640px`
-   Medium: `640–1023px`
-   Large: `1024–1279px`
-   Extra large: `1280px+`

These are layout guidance, not hard restrictions.

Validate at minimum: - Narrow mobile width around 360 px. - Common
mobile width around 390--430 px. - Tablet portrait and landscape. -
Desktop around 1280 px. - Wide desktop around 1440 px.

Responsive requirements: - No unintended horizontal overflow. - Primary
actions remain visible and reachable. - Tables transform to cards or use
a clearly bounded horizontal-scroll region only when necessary. -
Evidence previews fit the viewport. - Dialogs fit short screens and
respect safe areas. - Sticky actions do not cover focused inputs or
validation errors.

------------------------------------------------------------------------

## 12. Motion and imagery

Follow the reference's restrained visual style.

-   Use subtle transitions for hover, focus, and state changes.
-   Avoid parallax, looping animation, heavy blur, or decorative motion
    in the authenticated app.
-   Use abstract blue forms only on the public hero or selected empty
    states.
-   Decorative imagery must not compete with defect evidence or workflow
    controls.
-   Use local assets where practical.
-   Provide meaningful alternative text for informative images and empty
    alt text for purely decorative images.
-   Do not use generated factory imagery to imply real customers,
    facilities, or endorsements.

------------------------------------------------------------------------

## 13. Implementation constraints

Before implementing this specification:

1.  Inspect the existing frontend and identify reusable layouts,
    components, routes, styles, and tokens.
2.  Map the design requirements to existing screens.
3.  Implement the smallest coherent set of changes needed.
4.  Preserve established API contracts and state-machine behavior.
5.  Keep UI authorization hints consistent with server-side
    authorization, without treating them as a security boundary.
6.  Avoid changing database schemas or backend policies solely for
    styling.
7.  Avoid adding dependencies without a clear need.
8.  Do not hardcode real company/legal details, credentials, analytics
    IDs, or fabricated customer data.
9.  Do not build dead buttons or decorative controls that imply
    unimplemented functionality.
10. Keep the public website and authenticated product separate in
    information architecture while maintaining one visual identity.

If the existing code differs from this document, inspect the actual
implementation and document any necessary adaptation rather than blindly
overwriting working code.

------------------------------------------------------------------------

## 14. Definition of done

The frontend design is not complete merely because it looks similar to
the reference screenshot.

### Visual acceptance

-   White, pale blue-gray, and deep blue form a coherent visual system.
-   Typography and spacing are consistent.
-   Cards, panels, buttons, and forms use reusable components.
-   The public website reflects the reference's spacious editorial
    composition.
-   The authenticated product is compact, practical, and
    workflow-focused.
-   No placeholder gibberish, fake claims, or unrelated reference
    content remains.

### Functional acceptance

-   Every visible control has a real, tested behavior or a clear
    disabled state.
-   Forms provide correct validation and failure feedback.
-   Loading, empty, success, and error states are designed.
-   Workflow actions reflect the actual server-authoritative case state.
-   Evidence preview/download follows existing authorization rules.
-   The UI never claims a case is closed before the required
    verification and server confirmation.

### Responsive and accessibility acceptance

-   Critical workflows work on mobile, tablet, and desktop.
-   No unintended horizontal overflow at target widths.
-   Contrast is measured and passes where required.
-   Keyboard focus, labels, validation, and status announcements are
    usable.
-   Reduced-motion preferences are respected.

### Delivery

Provide: 1. Files changed and why. 2. Screens/routes updated. 3.
Responsive and accessibility checks performed. 4. Any missing backend
functionality that prevents a frontend interaction from being completed.
5. Screenshots or browser evidence from actual rendered pages when the
environment supports them. 6. Build and test results, with failures and
unverified areas reported honestly.

**Final instruction:** Use the supplied screenshot as a reference for
the visual language---white space, pale blue-gray surfaces, deep blue
accents, rounded CTAs, and balanced editorial composition. Adapt that
language to FixLoop's industrial quality workflow. Do not copy the
screenshot literally, do not redesign unrelated backend behavior, and do
not sacrifice clarity, accessibility, or secure evidence handling for
aesthetics.
