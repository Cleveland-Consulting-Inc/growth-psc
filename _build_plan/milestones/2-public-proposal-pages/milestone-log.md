# Milestone 2 — Public Proposal Pages

## What's new in the app

- **Public proposal pages** — coaches can visit `growth.premiersportscamps.com/[slug]/` to view any live proposal
- **PIN gate** — each proposal requires a 4-digit PIN before content is shown; the PIN is verified server-side and never exposed in the browser
- **Session persistence** — a correct PIN grants an 8-hour session cookie scoped to that proposal URL; coaches don't need to re-enter the PIN during the same browsing session
- **Wrong PIN handling** — entering an incorrect PIN shows an error message and clears the input; no lockout, coach can try again immediately
- **Offline state** — proposals toggled offline show a branded "not currently available" message instead of the PIN screen
- **Access logging** — every PIN attempt (correct or incorrect) is automatically recorded with IP address, browser string, timestamp, and result; visible in the admin per-proposal log viewer
- **Sport-specific branding** — the PIN gate and rendered proposal each display the correct sport logo (Wilson Tennis Camps, US Lacrosse Camps, US Volleyball Camps, Elite 11 Soccer Camps) based on which sport the proposal was created for
- **Rendered pitch deck** — after a correct PIN, coaches see the full proposal rendered in the Wilson Tennis Camps HTML pitch deck style, populated with the proposal's content fields
- **Multi-sport system** — admin can now create proposals for any of 4 sports; each sport has its own default content, logo, and accent color

---

## What was built

### Files created
```
src/
  components/
    ProposalPage.vue               ← full pitch deck renderer, sport-aware
  pages/
    [slug]/
      index.vue                    ← PIN gate + offline state + proposal route
  server/
    api/
      proposals/
        [slug].get.ts              ← public endpoint (returns proposal minus PIN)
        [slug]/
          verify.post.ts           ← PIN check, access log write, session cookie
    utils/
      sports.ts                    ← SPORTS config + sportDefaultContent() per sport
  public/
    images/
      logos/
        wilson-tennis-camps-logo.png
        us-lacrosse-camps-logo.png
        us-volleyball-camps-logo.png
        elite11-soccer-camp-logo.png
      sports/tennis/
        hero.jpg, about.jpg, split.jpg, fullbleed.jpg, brand.jpg
```

### Files deleted (M1 cleanup)
```
src/server/api/admin/template/index.get.ts   ← templates table removed
src/server/api/admin/template/index.put.ts
src/pages/admin/template.vue                 ← templates are now code-only
```

### Files modified
```
src/server/utils/db.ts             ← removed templates table, added sport column to proposals
src/server/api/admin/proposals/index.post.ts  ← uses sportDefaultContent() instead of DB template
src/pages/admin/proposals/new.vue  ← added sport picker dropdown
src/pages/admin/index.vue          ← added sport column to dashboard table
src/layouts/admin.vue              ← removed Template nav link
```

### Database changes
- `templates` table removed (content defaults now live in `src/server/utils/sports.ts`)
- `proposals` table: added `sport TEXT NOT NULL DEFAULT 'tennis'` column (added via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for safe migration)

---

## Decisions not pre-specified in the PRD

- **Templates moved to code** — the PRD specified a single DB-backed template editable by admins. During M2 planning, the requirement expanded to one template per sport. Since templates are developer-designed (not admin-edited), they were moved entirely to `sports.ts` as TypeScript objects. This eliminates the templates DB table and the admin template editor entirely.

- **Sport system** — not in the original PRD. Added `sport` field to proposals, a `SPORTS` config object in code, and sport-specific logos and accent colors. New sports can be added by a developer by adding an entry to `SPORTS` in `sports.ts`.

- **Images stored in `src/public/`** — tennis photos extracted from the Wilson HTML reference and committed to the repo. Vercel serves them as static CDN assets. Non-tennis sports use a solid dark background for now; sport-specific photos to be added per-sport in future iterations. Logos sourced from the PSC Website Rebuild project.

- **8-hour session cookie scoped to slug path** — PIN sessions expire after 8 hours (not on browser close, not 30 days). Scoped to `/{slug}` path so a session for Yale doesn't grant access to Duke.

- **Access log written on every verify attempt** — including offline proposals (the verify route returns early with `reason: 'offline'` but the log is written before checking, capturing the attempt).

- **Wilson template used as baseline for all 4 sports** — Lacrosse, Volleyball, and Soccer use the same layout with their respective logo and accent color, solid dark background instead of photos. Per-sport photo sets and design refinements deferred to future iteration.

---

## What a future milestone would need to know

- **Adding a new sport**: add an entry to `SPORTS` in `src/server/utils/sports.ts`, add a logo to `src/public/images/logos/`, optionally add sport photos to `src/public/images/sports/[sport]/`, and set `hasPhotos: true` in the config
- **Per-sport proposal page design**: `ProposalPage.vue` is currently one shared component. If sports need structurally different layouts, extract sport-specific components and conditionally render based on `proposal.sport`
- **PIN session duration**: currently hardcoded at 8 hours in `verify.post.ts` — `maxAge: 60 * 60 * 8`
- **Access log** writes happen in `src/server/api/proposals/[slug]/verify.post.ts` — extend here for any future enrichment (geolocation, etc.)
