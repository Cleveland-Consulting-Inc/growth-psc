import { sql } from '@vercel/postgres'

export { sql }

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS proposals (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      university_name TEXT NOT NULL,
      pin CHAR(4) NOT NULL,
      status TEXT NOT NULL DEFAULT 'live',
      sport TEXT NOT NULL DEFAULT 'tennis',
      content JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Add sport column if upgrading from milestone 1 schema
  await sql`
    ALTER TABLE proposals ADD COLUMN IF NOT EXISTS sport TEXT NOT NULL DEFAULT 'tennis'
  `

  await sql`
    CREATE TABLE IF NOT EXISTS access_logs (
      id SERIAL PRIMARY KEY,
      proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
      ip_address TEXT,
      user_agent TEXT,
      pin_correct BOOLEAN NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}
