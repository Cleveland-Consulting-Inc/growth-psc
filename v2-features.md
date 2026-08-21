# v2 Feature Ideas

Running list — categorized for eventual build. Nothing here is scheduled yet.

---

## Proposals

### Delete a proposal
Allow admins to delete an existing proposal entirely.

### Rebuild proposal from current template
If the template for a sport has changed significantly (new CSS, images, style updates), allow an admin to "rebuild" an existing proposal using the current template while preserving all modified data (pricing, contact info, custom content, etc.). Template structure/styles import fresh; user-entered data carries over.

**Key constraint:** Rebuilds are always manual / on-demand — proposals never auto-update when a template changes.

### Per-proposal package percentage split

**Problem:** The 80%/75% revenue split displayed on proposals is currently hardcoded in `ProposalPage.vue`. The database fields `package_1_percent` and `package_2_percent` exist but are no longer rendered — they store stale copy ("25% of camp profit to PSC") and are ignored at display time.

**Goal:** Make the displayed percentage split data-driven and per-proposal, so a non-standard deal (e.g., a 30/70 split for a high-volume program) can be reflected accurately in the graphical display without touching the component.

**What needs to change:**
- Add two new database fields per proposal: `package_1_keep_pct` and `package_2_keep_pct` (integers, e.g., `75` and `80`). These represent what the coach keeps.
- The large red number and "of camp revenue stays with you" label in `ProposalPage.vue` should read from these fields, falling back to `75` / `80` if not set.
- The admin proposal editor should expose these as editable number fields alongside the package name and tagline.
- Retire the old `package_1_percent` / `package_2_percent` string fields or repurpose them as internal notes.
- Update `sportDefaultContent` in `sports.ts` to seed the new fields correctly for new proposals.

**Key constraint:** Changing the default percentage in `sportDefaultContent` should not affect existing proposals — only new ones created after the change.

### Book-a-meeting CTA
Replace or supplement the current call-to-action with a scheduling link (Calendly or similar). Admins should be able to configure a booking URL per proposal or globally. The link renders as a button in the proposal so prospects can schedule directly without a separate email exchange.

