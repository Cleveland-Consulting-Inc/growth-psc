import { getRouterParam, createError } from 'h3'
import { sql } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { rows } = await sql`SELECT * FROM proposals WHERE id = ${id}`
  if (!rows[0]) throw createError({ statusCode: 404, message: 'Proposal not found' })
  return rows[0]
})
