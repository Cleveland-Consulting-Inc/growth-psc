# v2 Feature Ideas

Running list — categorized for eventual build. Nothing here is scheduled yet.

Each entry includes: **How it works** (implementation summary) and **Issues to consider** (open questions or risks before building).

---

## Proposals

### Delete a proposal
**How it works:** A "Delete" button on the proposal edit page triggers a `DELETE /api/admin/proposals/[id]` endpoint. The database row and all associated access logs are removed permanently. A confirmation dialog prevents accidental deletion.

**Issues to consider:**
- Deletion is permanent and unrecoverable — confirm whether soft-delete (archive) would be safer than hard-delete, especially if access log history has audit value.
- If a coach tries the old URL after deletion, they'll hit a 404. Is that the right experience, or should deleted proposals show the "not available" screen instead?

---

### Rebuild proposal from current template
**How it works:** A "Rebuild from template" button on the proposal edit page fetches the current template for that sport, extracts its structural/style elements, and merges them into the existing proposal — keeping all saved data fields (pricing, contact info, custom text) but replacing HTML structure, CSS, and images with the latest template version.

**Issues to consider:**
- Defining the boundary between "template structure" and "proposal data" is the hard part. Needs a clear spec of which fields are data-owned vs. template-owned, or a merge conflict could silently overwrite content.
- A rebuild is not easily undoable. Should there be a snapshot of the pre-rebuild state saved automatically?
- If the template has added new fields that the proposal doesn't have yet, what are the defaults?

---

### Per-proposal package percentage split
**How it works:** Two new integer fields (`package_1_keep_pct`, `package_2_keep_pct`) are added to the proposals table. The large percentage display in `ProposalPage.vue` reads from these instead of hardcoded values. The admin proposal editor exposes them as editable number inputs. Existing proposals default to `75` / `80` via fallback, so nothing visually changes unless an admin explicitly edits them.

**Issues to consider:**
- PSC staff need to know the standard split is 75/80 and understand that changing these numbers changes what the coach sees in the live proposal. Clear labeling in the admin UI is important.
- The old `package_1_percent` / `package_2_percent` string fields in the database are currently unused — they should be formally retired or repurposed to avoid confusion during build.

---

### Book-a-meeting CTA
**How it works:** A new `booking_url` field is added per proposal (or set globally in a config). The proposal page renders a "Book a Meeting" button that links to the Calendly (or equivalent) URL. Could be a simple anchor that opens in a new tab — no Calendly embed required unless desired.

**Issues to consider:**
- Calendly links are tied to a specific calendar and owner. If the link is per-proposal, it adds admin setup overhead for each new proposal. A single global default URL with a per-proposal override is probably the right model.
- Embedded scheduling widgets (Calendly's inline embed) require loading their JS, which affects page performance and introduces a third-party dependency in a proposal the coach has already PIN-gated. A plain link avoids all of that.
- Should the booking link replace the existing CTA or sit alongside it?

---

### Proposal expiration dates
**How it works:** An optional date field is added to each proposal in the admin editor. A server-side check at proposal-view time compares the current date against the expiration date and treats expired proposals the same as offline ones — coaches see the "not currently available" screen. No cron job required; the check happens on each request.

**Issues to consider:**
- The admin should see clearly which proposals are expired vs. manually offline vs. live — they're currently all just "online" or "offline." The dashboard status display needs a third state.
- Should an admin be able to un-expire a proposal by clearing the date or extending it? Yes, but that should be deliberate — confirm the UX.
- Timezone handling: "expires on Dec 31" means end of day in which timezone? PSC's timezone should be the reference, and it should be explicit in the UI.

---

## Coach Experience

### Coach-facing contact / reply button
**How it works:** A button at the bottom of the proposal page (visible after PIN entry) opens a short form — name, email, message — or generates a pre-filled `mailto:` link to a PSC contact address. The simplest version is just a `mailto:` with the subject pre-filled. A form version would POST to an API endpoint that sends an email.

**Issues to consider:**
- A `mailto:` link requires the coach to have a mail client configured, which is unreliable. A form is more dependable but requires an email-sending integration (Resend, Postmark, etc.).
- Spam/bot submissions: form needs at minimum a honeypot field since it's accessible to anyone who has the PIN.
- Should replies go to a global PSC inbox, or to a per-proposal contact address? If multiple staff manage different proposals, a per-proposal "reply-to" email would be cleaner.

---

## Admin & Operations

### Email notification on coach view
**How it works:** When a coach successfully verifies a PIN, the `verify.post.ts` endpoint (after logging the access) triggers an email to the admin — or to a per-proposal notification address — with the proposal name, timestamp, and browser/IP details. Requires an email-sending integration (Resend, Postmark, or similar).

**Issues to consider:**
- Needs an email service dependency — Resend has a generous free tier and a simple API, but it's still a new integration to manage.
- A coach who opens the proposal multiple times (e.g., refreshes, comes back a day later) would generate multiple notifications. Needs a de-dupe strategy: notify only on first successful view per proposal, or only if no successful view in the last X hours.
- Per-proposal opt-in/opt-out is important — not every proposal may be worth a notification, and noise will cause admins to start ignoring them.

---

### Admin audit log
**How it works:** A new `admin_events` table records every meaningful admin action: what changed, the previous value, the new value, and the timestamp. This is written server-side at the point of the action, not by the client. The admin dashboard gets a log viewer similar to the existing access log viewer.

**Issues to consider:**
- Determining what counts as a "meaningful" action vs. noise (e.g., every keystroke in an edit field vs. every save) needs a clear spec.
- If multiple admin users are added (see below), the log needs to record *who* did the action — so this feature and multi-user accounts are somewhat coupled.
- The old `package_1_percent` / `package_2_percent` removal would be a schema migration — make sure existing audit-like data is preserved or documented before retiring columns.

---

### Multiple admin users / roles
**How it works:** Replace the single shared `ADMIN_PASSWORD` environment variable with a `admin_users` table (email + hashed password). A login form accepts email + password. Sessions are tied to a user ID. The admin dashboard shows which user is logged in. Optionally, a "viewer" role can see proposals and logs but cannot edit.

**Issues to consider:**
- This is a significant auth rewrite. The current HMAC cookie session is simple and stateless — moving to user-aware sessions requires server-side session storage (Postgres or Vercel KV).
- Password reset flow: without a recovery mechanism, a forgotten password locks an account. Requires an email-sending integration.
- Alternatively, a managed auth provider (Clerk, Auth0) handles all of this and adds MFA for free — worth considering vs. building from scratch given this is a small team.
- Role granularity: is "viewer vs. editor" enough, or will you eventually need "editor of their own proposals only"?

---

### Monitoring / alerting on failed PIN attempts
**How it works:** A background check — either a lightweight scheduled job or a real-time threshold evaluated on each failed attempt — queries `access_logs` for a spike in failures on a given proposal within a rolling window (e.g., 20 failures in 10 minutes). When the threshold is crossed, an alert fires: email, webhook to Slack, or a visible badge in the admin dashboard.

**Issues to consider:**
- A real-time check on every failed attempt is simple to implement but adds a DB query to each request. A scheduled job (e.g., run every 5 minutes) offloads this but delays detection.
- Alert fatigue: a threshold that's too low will generate noise. Needs tuning based on real traffic patterns.
- This only matters meaningfully once rate limiting (already built) doesn't fully stop an attacker — it's a monitoring layer, not a primary defense.

---

## Analytics

### Advanced proposal analytics
**How it works:** JavaScript on the proposal page (loaded after PIN entry) fires events to a server endpoint as the coach scrolls and lingers on sections — scroll depth checkpoints, time-on-page, section visibility via IntersectionObserver. Stored per-visit in a new `analytics_events` table. The admin proposal view gets a simple summary: "viewed 80% of the page, spent ~4 min."

**Issues to consider:**
- This is a meaningful build — event schema, storage, and a reporting UI all need to be designed. The simplest useful version might just be "did the coach scroll past the pricing section?" rather than a full heatmap.
- Privacy: more detailed behavioral tracking puts this squarely into territory that requires disclosure and likely a privacy policy update, even for B2B.
- Third-party analytics (Plausible, Fathom) could provide scroll depth out of the box without building custom event infra — worth evaluating before building from scratch.

---

### IP geolocation enrichment
**How it works:** When an access log entry is written, the IP address is passed to a geolocation API (MaxMind GeoLite2 or ipinfo.io free tier) to retrieve city, state, and country. The result is stored alongside the log entry. The access log viewer in admin shows location instead of (or alongside) the raw IP.

**Issues to consider:**
- Geolocation APIs vary in accuracy, especially for mobile/carrier IPs. University networks often resolve to the university's city, which is actually useful here — but VPNs and mobile data would show incorrect locations.
- Free tier limits: ipinfo.io free is 50k requests/month. MaxMind GeoLite2 is a local database file (no per-request cost) but requires a monthly download and bundling.
- Under GDPR/privacy law, enriching IP data makes the stored record more identifiable, which increases compliance burden. Worth reviewing if PSC works with European institutions.

---

## Content & Media

### CMS media library
**How it works:** A media management section in the admin panel lets admins upload images (sport hero shots, logos, coach photos) which are stored in Vercel Blob or equivalent. When editing a proposal or template, image fields show a picker that pulls from the media library rather than requiring a URL to be typed manually.

**Issues to consider:**
- This is the largest build on this list. It touches storage, the admin UI, the template editor, and the proposal editor simultaneously.
- File storage costs money at scale — Vercel Blob has a free tier but it's limited. Need a clear policy on how many images per sport/proposal are expected.
- Image optimization (resizing, format conversion to WebP) adds polish but also complexity. The simplest version is upload-and-store-as-is, with no transforms.
- This pairs naturally with the "single-platform file storage" infrastructure item below — worth doing those together.

---

### PDF export
**How it works:** A "Download PDF" button on the proposal page (admin-visible or coach-visible) triggers a server-side PDF render using a headless browser (Puppeteer/Playwright) or a document-generation library (html-to-pdf). The resulting file is streamed back as a download.

**Issues to consider:**
- Puppeteer/Playwright on Vercel serverless is heavyweight — binary size and cold-start time are significant. A dedicated rendering service (Browserless, PDFShift, Doppio) is easier to deploy but adds a monthly cost and an external dependency.
- The proposal's HTML is designed for the browser with scroll effects and sticky elements. A faithful print layout may require dedicated `@media print` CSS that doesn't currently exist.
- Who gets access to the download button? If the coach can download, they have a portable copy that persists after the proposal is taken offline — is that the intent?

---

## Infrastructure

### Single-platform file storage
**How it works:** Replace the current Vercel → NiXI PHP upload flow with direct uploads to Vercel Blob (or Cloudflare R2). The admin photo upload endpoint would generate a signed upload URL, the browser POSTs the file directly to blob storage, and the resulting URL is saved to the database. The PHP endpoint on NiXI is retired entirely.

**Issues to consider:**
- This eliminates the PHP secret and the cross-platform dependency — a clean security win. The red-team report flagged this as the highest-value infrastructure change.
- Vercel Blob is priced per GB stored and per GB transferred. At current proposal volume this is negligible, but worth noting.
- Existing coach photos are on the NiXI server at `premiersportscamps.com/coaches/`. A migration plan is needed to either move those files to blob storage or leave old URLs intact while new uploads go to the new location. A hybrid approach (old URLs still work, new uploads go to blob) is the lowest-risk path.
