import { getRouterParam, createError } from 'h3'
import { sql } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const { rows } = await sql`
    SELECT id, slug, university_name, sport, status, created_at
    FROM proposals WHERE slug = ${slug}
  `
  const proposal = rows[0]
  if (!proposal) throw createError({ statusCode: 404, message: 'Not found' })
  // Never expose the PIN on public routes
  return proposal
})
