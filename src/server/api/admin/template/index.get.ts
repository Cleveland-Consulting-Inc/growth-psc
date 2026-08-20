import { sql } from '../../../utils/db'

export default defineEventHandler(async () => {
  const { rows } = await sql`SELECT * FROM templates ORDER BY id DESC LIMIT 1`
  return rows[0] ?? null
})
