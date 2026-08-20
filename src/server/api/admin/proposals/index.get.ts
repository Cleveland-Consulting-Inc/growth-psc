import { sql } from '../../../utils/db'

export default defineEventHandler(async () => {
  const { rows } = await sql`
    SELECT
      p.*,
      COUNT(al.id) FILTER (WHERE al.pin_correct = true) AS view_count
    FROM proposals p
    LEFT JOIN access_logs al ON al.proposal_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `
  return rows
})
