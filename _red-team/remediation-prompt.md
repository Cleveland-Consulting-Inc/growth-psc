# Remediation Brief — Growth.PSC Critical & High Security Findings
**For:** Dev agent implementation session
**Source:** Red-team report dated 2026-08-20
**Scope:** Critical (C1–C3) and High (H1–H3) findings only

This brief describes six security problems and what needs to change. It is ordered by urgency. Read each section completely before touching code. Do not add features, refactor unrelated code, or change UI outside the scope described.

---

## STOP FIRST — Manual action required before any code changes

**C1: Hardcoded upload secret is live in a public repo right now.**

The file `nixi-upload/gp-upload.php` contains a hardcoded secret that is visible to anyone on GitHub. This requires a human to:

1. Generate a new secret (minimum 32 random hex characters): `openssl rand -hex 32`
2. Set it as an environment variable on the NiXI/cPanel server (e.g., via `.htaccess` or server config), NOT in the PHP file
3. Update the `UPLOAD_SECRET` environment variable in the Vercel project dashboard to the new value
4. Deploy the updated `gp-upload.php` (see code change below) to `premiersportscamps.com`
5. Optionally: purge the old secret from git history using `git filter-repo --path nixi-upload/gp-upload.php --invert-paths` or BFG

Only proceed with code changes after the secret is rotated.

---

## C1 — Fix: Remove hardcoded secret from gp-upload.php

**File:** `nixi-upload/gp-upload.php`

Replace the `define('UPLOAD_SECRET', ...)` line with an environment variable read. The secret must never appear as a literal string in this file again.

Replace:
```php
define('UPLOAD_SECRET', '009c1f519fde87c1694a93f04b623ed24b0e8a7c261c4456');
```

With:
```php
$uploadSecret = getenv('UPLOAD_SECRET') ?: '';
if (!$uploadSecret) {
    http_response_code(500);
    echo json_encode(['error' => 'Server misconfiguration']);
    exit;
}
```

Then update every use of `UPLOAD_SECRET` in the file to use `$uploadSecret` instead of the constant.

Also add `UPLOAD_SECRET` to `.env.example` with an empty value and a comment explaining it must be set:
```
# Shared secret for the NiXI photo upload endpoint (set same value on the PHP host)
UPLOAD_SECRET=
```

---

## C2 — Fix: Rate-limit PIN verification attempts

**File:** `src/server/api/proposals/[slug]/verify.post.ts`

No rate limiting currently exists. Add per-slug + per-IP attempt tracking in Postgres before the PIN is checked.

What needs to happen:
- Before verifying the PIN, count recent failed attempts for this combination of (slug, IP) in the `access_logs` table within the last 15 minutes
- If failed attempts reach 10 or more, return HTTP 429 with a message like "Too many attempts — try again in 15 minutes." Do not check the PIN at all
- Log the attempt in `access_logs` regardless (whether blocked or not), so the count stays accurate
- The counter should reset naturally as old log rows age out of the 15-minute window (no need to delete anything)

The IP address to use for rate-limiting is already extracted in this file (`x-forwarded-for` header, lines 14–16). Use the same value.

No new tables are needed. The `access_logs` table already has `proposal_id`, `ip_address`, `pin_correct`, and `timestamp` — query those for recent failures.

---

## C3 — Fix: Rate-limit admin login attempts

**File:** `src/server/api/auth/login.post.ts` (and a new server middleware or utility)

No rate limiting exists on the admin login endpoint. Add IP-based attempt tracking.

What needs to happen:
- Track failed login attempts by IP in Postgres. You will need a new table for this since there's no existing admin-action log. A minimal schema: `(id, ip_address TEXT, attempted_at TIMESTAMPTZ DEFAULT NOW())`; create it in `src/server/utils/db.ts` `initDb()` alongside the existing tables
- Before checking the password, query how many failed attempts this IP has made in the last 15 minutes
- If 5 or more, return HTTP 429: "Too many login attempts — try again later." Do not check the password
- On a successful login, you do not need to clear the counter — the time window handles expiry
- On a failed login, insert a row into the attempt log
- Include the IP from the `x-forwarded-for` header (same pattern as `verify.post.ts`)

---

## H1 — Fix: Stop serving proposal content to unauthenticated callers

**Files:**
- `src/server/api/proposals/[slug].get.ts` — public GET, currently returns full content
- `src/server/api/proposals/[slug]/verify.post.ts` — PIN verification, sets cookie on success

The public GET endpoint must not return `content` to callers who have not verified the PIN.

What needs to happen:
- In `src/server/api/proposals/[slug].get.ts`, change the SELECT to exclude the `content` column: `SELECT id, slug, university_name, sport, status, created_at FROM proposals WHERE slug = ${slug}`
- Add a new endpoint: `src/server/api/proposals/[slug]/content.get.ts` that returns the full content — but only if the per-proposal session cookie is present and valid. Check for the cookie named `proposal-${slug}` and verify its value is `'granted'`. If not present or incorrect, return HTTP 401
- In `src/pages/[slug]/index.vue`, update the fetch logic: after the user is `unlocked`, fetch `/api/proposals/${slug}/content` to get the content, and pass it to `<ProposalPage>`. Before unlock, only the stripped proposal data (university name, sport, status) is available — which is already enough to render the PIN gate and offline screens

Do not remove the proposal cookie logic in `verify.post.ts` — it stays as-is. The new `content.get.ts` endpoint validates that same cookie server-side.

---

## H2 — Fix: Normalize verify endpoint failure responses

**File:** `src/server/api/proposals/[slug]/verify.post.ts`

Currently the endpoint returns distinguishable reasons that reveal whether a slug exists. Change it to return a uniform failure response.

Replace:
```ts
if (!proposal) return { ok: false, reason: 'not_found' }
if (proposal.status === 'offline') return { ok: false, reason: 'offline' }
```

With a single normalized response for all non-success cases:
```ts
if (!proposal || proposal.status === 'offline') return { ok: false, reason: 'invalid' }
```

Update `src/pages/[slug]/index.vue` in the `verify()` function: the `res.reason === 'offline'` check currently triggers a status update. Since the reason is now `'invalid'` for both cases, you need another way to handle offline proposals. The simplest approach: the client already knows the proposal status from the initial fetch (H1 fix still returns `status`). If `status === 'offline'`, show the offline screen before the PIN form is rendered — which is already done in the template. Remove the `proposal.value!.status = 'offline'` mutation from the verify catch path; it's no longer needed.

---

## H3 — Fix: Store PINs as bcrypt hashes

**Files:**
- `src/server/utils/db.ts` — schema
- `src/server/api/admin/proposals/index.post.ts` — creates proposals
- `src/server/api/admin/proposals/[id].put.ts` — updates proposals
- `src/server/api/proposals/[slug]/verify.post.ts` — compares PIN

Add `bcryptjs` (pure-JS, no native bindings — works in Vercel serverless without issue) as a dependency.

What needs to happen:
- In `index.post.ts` (proposal creation), hash the PIN with bcrypt (work factor 12) before inserting: `const hashedPin = await bcrypt.hash(pin, 12)`; store `hashedPin` not `pin`
- In `[id].put.ts` (proposal update), when `body.pin` is provided, hash it before storing
- In `verify.post.ts`, replace the string equality check (`pin === proposal.pin`) with `await bcrypt.compare(pin, proposal.pin)`
- In `index.get.ts` (admin list) and `[id].get.ts` (admin detail), the PIN column will now contain a hash — the admin UI shows the PIN in the proposals table (`src/pages/admin/index.vue:37` and `src/pages/admin/proposals/[id].vue:11`). Since the hash is not the original PIN and can't be reversed, you must change those displays: either omit the PIN display entirely, or store the plaintext PIN separately for admin display only (defeats hashing for that purpose), or change the UX so PINs are set-only and never shown after creation

The cleanest UX approach: change the admin PIN field to "set-only." Show `••••` instead of the actual value. If the admin needs to know the PIN, they must generate and re-set it. Document this behavior change in the admin UI.

Existing proposals already in the database have plaintext PINs. Write a one-time migration script that reads all existing proposals, hashes each PIN, and updates the row. Run this migration once after deploying the new code. The `initDb()` pattern in `src/server/utils/db.ts` can include a migration step that checks for unhashed pins (a `CHAR(4)` pin that doesn't start with `$2b$` is plaintext) and hashes them on startup.

---

## Implementation order

1. C1: Rotate secret (manual) → update `gp-upload.php` → update `.env.example`
2. C2: Rate-limit PIN verification (Postgres query, no new table)
3. C3: Rate-limit admin login (new `login_attempts` table in `initDb()`)
4. H1: Strip content from public GET, add PIN-gated content endpoint, update Vue fetch
5. H2: Normalize verify response, update Vue client handling
6. H3: Add bcryptjs, hash PINs on create/update, compare on verify, migrate existing rows, update admin UI

Do not open a PR until all six are addressed. They interact: H2's response normalization depends on H1's offline-status client logic being fixed first.
