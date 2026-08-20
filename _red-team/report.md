# Red-Team Security Report — Growth.PSC
**Date:** 2026-08-20
**Reviewer:** 10th Man (adversarial review)
**Scope:** Full codebase audit — all API routes, auth, middleware, database, integrations, frontend

---

## System Summary

Growth.PSC is a Nuxt 3 / Vercel Postgres application that generates PIN-gated sales proposal pages for Premier Sports Camps university partnerships. An admin creates proposals (sport, URL slug, 4-digit PIN), edits rich content, and views access logs. University coaches receive a unique URL + PIN to view their customized proposal. A secondary PHP endpoint on a separate NiXI/cPanel host handles coach photo uploads.

**Key trust boundaries:**
- Admin password → HMAC-signed cookie → all `/api/admin/*` routes
- 4-digit PIN → per-proposal cookie → public proposal content
- Nuxt server → PHP upload endpoint via shared secret
- Browser → Vercel serverless functions (no WAF, no rate limiting on free tier)

**Deployment:** Vercel free tier (no WAF, no rate limiting). Repo is **public**. No WAF or CDN in front.

---

## Findings

### CRITICAL

---

#### C1 — Hardcoded upload secret in public repository (actively exploitable)
**File:** `nixi-upload/gp-upload.php:6`

```
define('UPLOAD_SECRET', '009c1f519fde87c1694a93f04b623ed24b0e8a7c261c4456');
```

This secret is in a **public GitHub repository**, readable by anyone on the internet. It is also permanently embedded in git history (commit `08a8c15`). Anyone can use it immediately to POST arbitrary image files to `https://premiersportscamps.com/gp-upload.php` without needing admin access to the Growth.PSC application.

The PHP endpoint validates only that the MIME type is an image. Files are written to `/coaches/` under the public webroot and served at `premiersportscamps.com/coaches/<filename>`.

**Worst case:** Attacker uploads large volumes of files to fill server disk, uses PSC's domain reputation to host phishing content, or triggers storage abuse. No admin session is required — the secret alone is sufficient.

**Remediation:**
1. Rotate the secret on the NiXI server immediately.
2. Move it to a server-side environment variable (`$_ENV['UPLOAD_SECRET']`); never hardcode it in the file.
3. Update the deployed `gp-upload.php` to read from environment.
4. Update the Vercel environment variable `UPLOAD_SECRET` to match the new value.
5. Run `git filter-repo` or BFG Repo Cleaner to purge the old secret from git history, then force-push. (Or accept that the old secret is permanently exposed and treat rotation as sufficient.)
6. Consider migrating to a single-platform file storage solution (Vercel Blob, Cloudflare R2, S3) to eliminate this split-deployment pattern entirely.

---

#### C2 — 4-digit PIN is trivially brute-forceable
**File:** `src/server/api/proposals/[slug]/verify.post.ts`

A 4-digit PIN has 10,000 possible values. The verify endpoint:
- Returns distinguishable responses (`wrong_pin` vs `ok`)
- Has no attempt counter, IP throttle, lockout, or CAPTCHA
- Is behind Vercel free tier, which provides no rate limiting
- Returns specific slug-existence information (see H2), enabling attackers to confirm targets before brute-forcing

At 10 requests/second: all PINs exhausted in ~17 minutes. At 100 req/sec: ~2 minutes.

**Worst case:** Anyone who learns a proposal URL gains full access to proposal content without knowing the PIN.

**Remediation:**
1. Implement per-slug rate limiting: track attempts in Postgres or Vercel KV; block after 10 failures per 15-minute window per IP.
2. Add a lockout (e.g., 30-minute cooldown after 10 failures) and return a `429` with a `Retry-After` header.
3. Consider increasing PIN entropy (6 digits = 1,000,000 combinations).
4. Long-term: add Cloudflare free tier in front of Vercel for platform-level rate limiting.

---

#### C3 — Admin login is brute-forceable with no mitigation
**File:** `src/server/api/auth/login.post.ts`

`/api/auth/login` is a public internet endpoint with:
- No rate limiting
- No lockout
- No MFA
- No CAPTCHA
- No WAF
- A default example password of `changeme` (`.env.example:2`)

A single shared password means a successful attack gives permanent, full-scope admin access.

**Worst case:** Admin account compromised via brute-force or dictionary attack; attacker reads all proposals and PINs, modifies live proposal content, or uses the authenticated upload channel for further exploitation.

**Remediation:**
1. Add rate limiting on login attempts (e.g., 5 per 15 minutes per IP) via a Nuxt server middleware.
2. Log and alert on repeated failures (email or webhook to a monitoring service).
3. Enforce a strong, randomly-generated admin password.
4. Consider replacing the password system with a hosted identity provider (Clerk, Auth0 — both have free tiers) that handles brute-force protection, MFA, and individual accounts.

---

### HIGH

---

#### H1 — Proposal content exposed at API level without PIN verification
**File:** `src/server/api/proposals/[slug].get.ts`

`GET /api/proposals/[slug]` returns the full `content` JSONB — all proposal text, financial package terms, and contact information — to any unauthenticated caller who knows the slug. The PIN gate exists only in the Vue component as a client-side cookie check. Anyone calling the API directly (curl, Postman, browser Network tab) bypasses the gate entirely.

Slugs follow a predictable university-name pattern and can be confirmed via the enumeration oracle described in H2.

**Worst case:** Competitors or other interested parties read proposal financial terms and contact information without ever entering a PIN.

**Remediation:**
Option A (recommended): Return only `{id, slug, university_name, sport, status}` from the public GET. Serve full content from a second endpoint that validates the per-proposal session cookie server-side before including `content`.
Option B: Validate the `proposal-{slug}` cookie in this handler before including `content` in the response body.

---

#### H2 — Verify endpoint distinguishes slug-not-found from wrong PIN (enumeration oracle)
**File:** `src/server/api/proposals/[slug]/verify.post.ts:11-12`

```ts
if (!proposal) return { ok: false, reason: 'not_found' }
if (proposal.status === 'offline') return { ok: false, reason: 'offline' }
```

An attacker can probe any slug and learn definitively whether it exists (`wrong_pin`) vs doesn't (`not_found`). This turns slug guessing into a precise oracle. Probe `yale`, `duke`, `stanford`, `ohio-state` — learn which universities have live proposals. Then focus brute-force only on confirmed targets (C2).

**Worst case:** Attacker maps all active proposals in minutes, then brute-forces each one.

**Remediation:** Return a uniform failure response regardless of reason: `{ ok: false }`. The client-side UX can display a generic message like "Incorrect PIN."

---

#### H3 — PINs stored in plaintext in the database
**File:** `src/server/utils/db.ts:10`

```sql
pin CHAR(4) NOT NULL
```

PINs are stored as cleartext strings. A database breach (leaked connection string, misconfigured IAM, or platform incident) exposes every PIN for every proposal simultaneously. Combined with slugs, this gives immediate access to all proposals without brute-forcing.

**Worst case:** Database read access → complete access to all proposals with zero effort.

**Remediation:** Store PINs as bcrypt hashes (work factor ≥ 12). Compare at verification time using `bcrypt.compare()`. Given 4-digit PINs are low-entropy, a high work factor is important to slow offline cracking.

---

### MEDIUM

---

#### M1 — HMAC session validation uses non-constant-time string comparison
**File:** `src/server/utils/session.ts:29`

```ts
if (expected !== sig) return false
```

JavaScript `!==` short-circuits on the first differing character, creating a timing side-channel. A statistical attacker making many requests can recover the expected HMAC signature one character at a time by measuring response time differences.

Practical exploitability over HTTP is low (network jitter is a significant confound), but this is a standard vulnerability in custom HMAC implementations and violates defense-in-depth.

**Remediation:** Replace with `crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'))`. Or replace the custom session implementation with `h3`'s `useSession()`.

---

#### M2 — Dead code in session.ts is a maintenance hazard
**File:** `src/server/utils/session.ts:5-8`

```ts
function sign(value: string, secret: string): string {
  // Simple HMAC-SHA256 signature using Web Crypto (available in Nitro/Node)
  return value // placeholder — replaced below with async version
}
```

This function returns the plaintext value unchanged (no signing). It is never called in current code, but its presence creates a hazard: a future developer refactoring this file could invoke `sign()` instead of `hmac()`, eliminating signature verification entirely without any visible error.

**Remediation:** Delete the dead `sign()` function. Consider replacing the entire custom session system with `useSession()` from `h3`, which is maintained and handles edge cases.

---

#### M3 — No security headers configured
**File:** No `nuxt.config.ts` visible; no security middleware present

No Content Security Policy, no `X-Frame-Options`, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Strict-Transport-Security`. Without a CSP, any injected content has maximum scope. Without `X-Frame-Options`, public proposal pages can be framed (clickjacking). Without `X-Content-Type-Options: nosniff`, browsers may MIME-sniff responses.

**Remediation:** Add security headers via `nuxt.config.ts` using `nitro.routeRules` or a global server middleware. Minimum recommended set:
```
Content-Security-Policy: default-src 'self'; img-src 'self' https://premiersportscamps.com; ...
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

#### M4 — photo_url accepts arbitrary URLs with no validation
**Files:** `src/server/api/admin/coach-library/push.post.ts:26-28`, `src/components/ProposalPage.vue:91`

Admin input for `photo_url` has no URL validation — no scheme check, no hostname allowlist. A value stored in `coach_library` propagates to all future proposals for that sport. It renders as `<img :src="coach.photo_url">` in the public proposal page, causing every viewer's browser to make a request to that host.

**Worst case (within admin-only input):** A stored tracking pixel leaks viewer IPs to a third party; a stored URL to a slow/large image degrades proposal performance for all viewers.

**Remediation:** Validate `photo_url` server-side: if non-empty, must be an absolute HTTPS URL with hostname `premiersportscamps.com`. Reject other values at the API.

---

#### M5 — Internal error messages forwarded to admin client
**File:** `src/server/api/admin/upload-photo.post.ts:28-29`

```ts
throw createError({ statusCode: 502, message: `Upload connection failed: ${err?.message ?? err}` })
```

Raw exception messages from failed network calls are sent to the client. Depending on error type, this could include internal hostnames, connection details, or stack traces.

**Remediation:** Log the full error server-side (`console.error(err)`); return a generic message to the client: `'Upload failed — please try again'`.

---

### LOW

---

#### L1 — No file size limit on photo upload
**File:** `src/server/api/admin/upload-photo.post.ts`

`readMultipartFormData()` reads the entire request body into memory before any size check. On Vercel free tier (limited memory, 10-second function timeout), a large or malicious upload could exhaust memory or time out.

**Remediation:** Check file size after `readMultipartFormData` and return a 413 if it exceeds a defined limit (e.g., 5 MB). Or configure `nuxt.config.ts` body size limits.

---

#### L2 — Proposal ID parameter not validated as integer
**Files:** `src/server/api/admin/proposals/[id].get.ts:5`, `[id].put.ts:9`

`getRouterParam(event, 'id')` is passed directly to parameterized SQL without integer validation. Parameterized queries prevent SQL injection, but non-numeric IDs cause a Postgres type error whose message may reach the client and reveal schema information.

**Remediation:**
```ts
const id = parseInt(getRouterParam(event, 'id') ?? '')
if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid ID' })
```

---

#### L3 — 30-day sessions with no server-side revocation
**File:** `src/server/utils/session.ts:11`

Sessions are stateless HMAC cookies with a 30-day TTL. Logout deletes the client-side cookie, but a copied or stolen cookie remains valid until expiry. There is no mechanism to invalidate all sessions (e.g., on password change or suspected compromise).

**Remediation:** Either reduce session duration (8 hours is more appropriate for an admin panel) or implement a server-side session store (Postgres or Vercel KV) so sessions can be invalidated explicitly.

---

#### L4 — IP addresses logged without anonymization or retention policy
**Files:** `src/server/utils/db.ts:22-29`, `src/server/api/proposals/[slug]/verify.post.ts:14-17`

`access_logs` stores full IP addresses as plaintext. Under GDPR (and US state privacy laws), IP addresses are personal data requiring a legal basis for collection, a documented retention period, and a deletion mechanism. None of these exist.

**Remediation:** Anonymize IPs before storage (truncate last octet for IPv4, last 80 bits for IPv6), or document a legal basis and retention policy, and add a scheduled cleanup job.

---

#### L5 — sameSite: 'lax' on session and proposal cookies
**Files:** `src/server/utils/session.ts:17`, `src/server/api/proposals/[slug]/verify.post.ts:27`

`lax` permits cookies to be sent on top-level cross-site navigation. `strict` would not. There is no legitimate cross-site use case for either cookie.

**Remediation:** Change both to `sameSite: 'strict'`.

---

### ADVISORY

---

#### AD1 — Public repository exposes business terms and personal contact details
**File:** `src/server/utils/sports.ts:85-90`

Default proposal content hardcoded in `sportDefaultContent()` includes personal phone numbers, email addresses, and financial terms (25%/20% revenue split). These are readable by anyone who browses the public repo. The same data exists in database content, but the code exposure is immediate.

---

#### AD2 — No audit logging on admin actions

Creates, edits, status changes, and photo uploads produce no audit record. Only public PIN attempts are logged. A compromised or misused admin account leaves no forensic trail.

---

#### AD3 — No monitoring or alerting on failed attempts

The `access_logs` table passively records PIN failures, but nothing reads it for anomaly detection. A brute-force attack against C2 or C3 is invisible in real time.

---

## Architecture Concerns

| # | Concern | Strongest Counter-Argument |
|---|---------|---------------------------|
| A1 | Custom HMAC session implementation | `useSession()` from h3 is free, maintained, and handles timing-safe comparison, encoding, and expiry — this wheel didn't need reinventing |
| A2 | Single shared admin password, no individual accounts, no admin audit trail | Any team turnover or suspected compromise requires a full password rotation affecting all users simultaneously |
| A3 | PIN gate is client-side over fully-exposed server content | The gate can never be more than a UX affordance; the content is always server-delivered before authorization is confirmed |
| A4 | Split deployment (Vercel + NiXI cPanel) with shared secret | Eliminatable: Vercel Blob or Cloudflare R2 would handle uploads on a single platform, removing the PHP endpoint and the secret entirely |
| A5 | Vercel free tier with no WAF, public repo required | The free-tier constraint directly enables C2 and C3; a $20/month Vercel Pro plan or free Cloudflare proxy would mitigate both without code changes |

---

## Risk Summary

| Severity | Count | Top Item |
|----------|-------|----------|
| Critical | 3 | Hardcoded secret in public repo (C1 — actively exploitable now) |
| High | 3 | Proposal content exposed without PIN (H1) |
| Medium | 5 | No security headers (M3), non-constant-time HMAC (M1) |
| Low | 5 | No session revocation (L3), no upload size limit (L1) |
| Advisory | 3 | No admin audit log (AD2) |

**Immediate action required:** C1 (secret rotation), C2 (rate limiting on PIN), C3 (rate limiting on login).
