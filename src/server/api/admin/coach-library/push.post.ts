import { readBody } from 'h3'
import { sql } from '../../../utils/db'
import { SPORTS } from '../../../utils/sports'
import type { SportSlug } from '../../../utils/sports'

export default defineEventHandler(async (event) => {
  const { sport, coaches } = await readBody(event)

  if (!sport || !SPORTS[sport as SportSlug]) {
    throw createError({ statusCode: 400, message: 'Invalid sport' })
  }
  if (!Array.isArray(coaches) || coaches.length === 0) {
    throw createError({ statusCode: 400, message: 'No coaches provided' })
  }

  let added = 0
  let skipped = 0

  for (const coach of coaches) {
    const name = (coach.name ?? '').trim()
    if (!name) continue

    const { rowCount } = await sql`
      INSERT INTO coach_library (sport, name, position, university, photo_url)
      VALUES (
        ${sport},
        ${name},
        ${(coach.position ?? '').trim()},
        ${(coach.university ?? '').trim()},
        ${(coach.photo_url ?? '').trim()}
      )
      ON CONFLICT (sport, name) DO NOTHING
    `
    if (rowCount && rowCount > 0) added++
    else skipped++
  }

  return { added, skipped }
})
