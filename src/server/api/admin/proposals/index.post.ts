import { readBody, createError } from 'h3'
import { sql } from '../../../utils/db'
import { sportDefaultContent, SPORTS } from '../../../utils/sports'
import type { SportSlug } from '../../../utils/sports'

export default defineEventHandler(async (event) => {
  const { university_name, slug, pin, sport } = await readBody(event)

  if (!university_name || !slug || !pin || !sport) {
    throw createError({ statusCode: 400, message: 'university_name, slug, pin, and sport are required' })
  }
  if (!/^\d{4}$/.test(pin)) {
    throw createError({ statusCode: 400, message: 'PIN must be exactly 4 digits' })
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 400, message: 'Slug may only contain lowercase letters, numbers, and hyphens' })
  }
  if (!SPORTS[sport as SportSlug]) {
    throw createError({ statusCode: 400, message: 'Invalid sport' })
  }

  const content = sportDefaultContent(sport as SportSlug)

  const { rows } = await sql`
    INSERT INTO proposals (slug, university_name, pin, status, sport, content)
    VALUES (${slug}, ${university_name}, ${pin}, 'live', ${sport}, ${JSON.stringify(content)}::jsonb)
    RETURNING *
  `
  return rows[0]
})
