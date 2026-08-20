import { getRouterParam } from 'h3'
import { sql } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { rows } = await sql`
    SELECT * FROM access_logs
    WHERE proposal_id = ${id}
    ORDER BY timestamp DESC
  `
  return rows
})
