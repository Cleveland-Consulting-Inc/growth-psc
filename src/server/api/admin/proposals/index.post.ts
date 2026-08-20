import { readBody, createError } from 'h3'
import { sql } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const { university_name, slug, pin } = await readBody(event)

  if (!university_name || !slug || !pin) {
    throw createError({ statusCode: 400, message: 'university_name, slug, and pin are required' })
  }
  if (!/^\d{4}$/.test(pin)) {
    throw createError({ statusCode: 400, message: 'PIN must be exactly 4 digits' })
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 400, message: 'Slug may only contain lowercase letters, numbers, and hyphens' })
  }

  // Snapshot current template content
  const { rows: trows } = await sql`SELECT content FROM templates ORDER BY id DESC LIMIT 1`
  const templateContent = trows[0]?.content ?? {}

  const { rows } = await sql`
    INSERT INTO proposals (slug, university_name, pin, status, content)
    VALUES (${slug}, ${university_name}, ${pin}, 'live', ${JSON.stringify(templateContent)}::jsonb)
    RETURNING *
  `
  return rows[0]
})
