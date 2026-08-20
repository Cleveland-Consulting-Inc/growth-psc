import { readBody } from 'h3'
import { sql } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const { content } = await readBody(event)
  const { rows } = await sql`
    UPDATE templates
    SET content = ${JSON.stringify(content)}::jsonb,
        version = version + 1,
        updated_at = NOW()
    WHERE id = (SELECT id FROM templates ORDER BY id DESC LIMIT 1)
    RETURNING *
  `
  return rows[0]
})
