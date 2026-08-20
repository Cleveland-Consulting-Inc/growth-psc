export interface Release {
  version: string
  date: string
  features: string[]
}

export const changelog: Release[] = [
  {
    version: 'v1.4',
    date: 'August 2026',
    features: [
      'Sport Templates section added to the admin dashboard — each sport shows its logo, brand name, and a Preview button that opens the current HTML template in a new tab.',
      'Template preview is served live from disk, so any edits to the source HTML are reflected immediately without a redeploy.',
      'Sports without a template yet show a disabled placeholder; enabling a new sport requires one line in the server route.',
      'Wilson Tennis Camps template updated: Our Approach section expanded to three cards (You work for yourself / You work for the model / We work for you) and repositioned above the packages section.',
      'Classic package card restyled to match the dark section theme; package order updated to Classic first, Collegiate second.',
    ],
  },
  {
    version: 'v1.3',
    date: 'August 2026',
    features: [
      'Security hardening: PIN attempts are now rate-limited to 10 tries per 15 minutes per IP — brute-force access to proposals is blocked at the server.',
      'Admin login is rate-limited to 5 attempts per 15 minutes per IP to prevent password guessing attacks.',
      'PINs are now stored as secure hashes — the original digits are never saved in the database, protecting proposals even if the database were compromised.',
      'Proposal content is gated server-side: the full pitch deck is no longer accessible via the API without a valid PIN session, closing a bypass that existed in earlier versions.',
      'PIN reset: admins can now set a new PIN for any proposal directly from the proposal edit page without recreating the proposal.',
      'Proposal pages no longer reveal whether a URL slug exists to unauthenticated callers — failed access attempts return a uniform response.',
    ],
  },
  {
    version: 'v1.2',
    date: 'August 2026',
    features: [
      'Coach roster: each proposal now supports a structured list of coaches with name, position, university, and photo — replacing the previous plain-text field.',
      'Coach photos can be added by uploading a file directly from your computer or by pasting a copied image into the photo field — images are stored on the Premier Sports Camps server and linked automatically.',
      'Coach library: coaches added to any proposal can be pushed to a shared library with one click. New proposals for the same sport are pre-populated with library coaches, so you\'re not starting from scratch each time.',
      'Push to Library button in the Coach Network section deduplicates by name, so re-pushing an updated roster won\'t create duplicates.',
    ],
  },
  {
    version: 'v1.1',
    date: 'August 2026',
    features: [
      'Public proposal pages: coaches can visit a branded pitch deck at a unique URL with a 4-digit PIN — no account required.',
      'Sport-specific branding: proposals support four sports (Wilson Tennis Camps, US Lacrosse Camps, US Volleyball Camps, Elite 11 Soccer Camps), each with its own logo and accent color.',
      'PIN gate: coaches enter a PIN before viewing a proposal; sessions persist for 8 hours so they don\'t have to re-enter on the same device.',
      'Access logging: every PIN attempt — correct or incorrect — is recorded with timestamp, IP address, and browser, visible in the admin per-proposal log.',
      'Offline toggle: proposals can be taken offline instantly from the dashboard; coaches see a branded unavailable message rather than the content.',
      'Multi-sport proposal creation: new proposals are created for a specific sport and pre-populated with appropriate default content and branding.',
    ],
  },
  {
    version: 'v1.0',
    date: 'August 2026',
    features: [
      'Admin login with a secure session that persists for 30 days — no username required, password-only access.',
      'Proposal dashboard: view all proposals at a glance with sport, URL slug, PIN, live/offline status, and total view count.',
      'Create proposals: generate a new branded proposal for any sport with a university name, custom URL slug, and 4-digit PIN.',
      'Content editor: every section of the pitch deck — hero, about, coach network, services, packages, contact — is editable per proposal through a structured form.',
      'Live/offline toggle: proposals can be switched on or off instantly from both the dashboard and the proposal editor.',
      'Deployed to growth.premiersportscamps.com with automatic SSL and Vercel serverless infrastructure.',
    ],
  },
]
