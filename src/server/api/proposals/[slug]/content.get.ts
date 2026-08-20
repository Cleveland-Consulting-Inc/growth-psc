import { getRouterParam, getCookie, createError } from 'h3'
import { sql } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const cookie = getCookie(event, `proposal-${slug}`)
  if (cookie !== 'granted') {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { rows } = await sql`
    SELECT content FROM proposals WHERE slug = ${slug} AND status = 'live'
  `
  if (!rows[0]) throw createError({ statusCode: 404, message: 'Not found' })

  return rows[0].content
})
