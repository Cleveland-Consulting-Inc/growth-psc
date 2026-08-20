# Milestone 1 — Backend & Admin

## What's new in the app

- **Admin login** — password-protected login page at `/admin/login`; session persists for 30 days in an httpOnly cookie
- **Dashboard** — `/admin` lists every proposal with university name, URL slug, PIN, live/offline status badge, and successful view count; status can be toggled directly from the table
- **New Proposal form** — `/admin/proposals/new` lets you enter a university name (slug is auto-suggested), URL slug, and 4-digit PIN; creates the proposal and drops you on its edit page
- **Per-proposal content editor** — `/admin/proposals/[id]` shows labeled text fields for every editable section of the pitch deck (hero, about, coach network, services, packages, CTA, contacts, footer); saves independently per proposal
- **Live/offline toggle** — one-click button on each proposal's edit page and the dashboard table; takes effect immediately
- **Access log viewer** — at the bottom of each proposal's edit page, shows every visit attempt with timestamp, IP address, browser string, and whether the PIN was correct
- **Master Template editor** — `/admin/template` lets you edit the default content values that all future proposals start from; shows last-saved timestamp and version number; existing proposals are unaffected

---

## What was built

### Files created
```
nuxt.config.ts
package.json
.env.example
.gitignore
src/
  assets/main.css
  layouts/admin.vue
  middleware/auth.ts
  components/Field.vue
  pages/
    index.vue                       ← redirects to /admin
    admin/
      login.vue
      index.vue                     ← dashboard
      template.vue
      proposals/
        new.vue
        [id].vue                    ← content editor + logs
  server/
    middleware/admin-auth.ts        ← protects /api/admin/* server-side
    plugins/database.ts             ← runs initDb() on first start
    utils/
      db.ts                         ← schema init, defaultContent(), sql export
      session.ts                    ← HMAC-SHA256 signed cookie sessions
    api/
      auth/
        check.get.ts
        login.post.ts
        logout.post.ts
      admin/
        template/
          index.get.ts
          index.put.ts
        proposals/
          index.get.ts
          index.post.ts
          [id].get.ts
          [id].put.ts
          [id]/logs.get.ts
```

### Database schema (Postgres via Vercel)
- `templates` — single row, bumps `version` on every save
- `proposals` — slug (unique), university_name, pin (4-digit char), status ('live'|'offline'), content (JSONB), created_at
- `access_logs` — proposal_id (FK), ip_address, user_agent, pin_correct (boolean), timestamp

### Content blob structure
Every proposal (and the template) stores a JSONB `content` field with these keys:
`partner_name`, `page_title`, `hero_eyebrow`, `hero_headline`, `hero_subheadline`, `hero_stat_number`, `hero_stat_label`, `about_heading`, `about_psc_body`, `about_partner_body`, `about_stat_1/2/3_value/label`, `network_heading`, `network_body`, `network_coaches` (newline-delimited "Name, School"), `services` (newline-delimited "##|Heading|Description"), `package_1/2_name/subtitle/percent/tagline/features` (features newline-delimited), `cta_heading/subheading/body`, `contact_1/2_name/email/phone`, `footer_year`.

---

## Decisions not pre-specified in the PRD

- **Vercel Postgres instead of SQLite** — SQLite has no persistent filesystem on Vercel serverless. Vercel Postgres (managed inside the existing Vercel account, no new account needed) was chosen. Schema is Postgres; SQL syntax is standard throughout.
- **Hand-rolled HMAC sessions instead of a session library** — avoids adding a dependency for a single-user app. Sessions are signed with HMAC-SHA256 using `crypto.subtle` (available in all Nitro runtimes) and stored in an httpOnly cookie with a 30-day expiry.
- **`SESSION_SECRET` env var** — required alongside `ADMIN_PASSWORD`. Both are set in the Vercel dashboard. `.env.example` documents them.
- **`defaultContent()` utility** — seeded from the Wilson Tennis Camps 2027 HTML. All editable pitch-deck fields are pre-populated with realistic Wilson defaults so the template is immediately usable.
- **Array-type content fields stored as delimited strings** — coaches (`Name, School` per line), services (`##|Heading|Description` per line), and package features (one per line) are stored as newline-delimited strings rather than nested JSON arrays. This keeps the content editor as plain textareas without needing a dynamic row builder, and keeps the JSONB structure flat. Milestone 2 will parse these strings when rendering the proposal pages.

---

## What Milestone 2 needs to know

- **Proposal pages** live at `/[slug]/` — use a dynamic `pages/[slug]/index.vue` with server-side DB lookup by slug
- **PIN verification** must happen server-side (never expose the PIN in client JS). Suggested pattern: a `POST /api/proposals/[slug]/verify` route that checks the PIN and writes an `access_log` row, then sets a short-lived session cookie scoped to that slug
- **Access log writes** on every visit attempt (correct and incorrect PIN) — `proposal_id`, `ip_address` (from `getHeader(event, 'x-forwarded-for') ?? event.node.req.socket.remoteAddress`), `user_agent` (from `getHeader(event, 'user-agent')`)
- **Offline proposals** — check `proposal.status === 'offline'` before serving any content; show an "unavailable" message
- **Content parsing for rendering**:
  - `network_coaches` → split on `\n`, then split each line on `, ` to get `[name, school]`
  - `services` → split on `\n`, then split each line on `|` to get `[number, heading, body]`
  - `package_1_features` / `package_2_features` → split on `\n`
- **Design source** — `Original_html/Wilson_Tennis_Camps_2027.html` is the reference pitch deck. The proposal page Vue component should reproduce its layout and visual design using the content fields from the proposal record
- **`db.ts`** exports `sql` (from `@vercel/postgres`) — import it in new server routes the same way existing routes do
