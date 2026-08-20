import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'

export { sql }

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS proposals (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      university_name TEXT NOT NULL,
      pin TEXT NOT NULL,
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

  // Widen pin column from CHAR(4) to TEXT to accommodate bcrypt hashes
  await sql`
    ALTER TABLE proposals ALTER COLUMN pin TYPE TEXT
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

  await sql`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id SERIAL PRIMARY KEY,
      ip_address TEXT NOT NULL,
      attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS coach_library (
      id SERIAL PRIMARY KEY,
      sport TEXT NOT NULL,
      name TEXT NOT NULL,
      position TEXT NOT NULL DEFAULT '',
      university TEXT NOT NULL DEFAULT '',
      photo_url TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (sport, name)
    )
  `

  // Migrate any plaintext PINs (4-digit strings) to bcrypt hashes
  const { rows: plaintext } = await sql`
    SELECT id, pin FROM proposals WHERE pin NOT LIKE '$2b$%'
  `
  for (const row of plaintext) {
    const hashed = await bcrypt.hash(row.pin, 12)
    await sql`UPDATE proposals SET pin = ${hashed} WHERE id = ${row.id}`
  }
}
