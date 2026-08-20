import { getRouterParam, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { sql } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Allow patching content, status, pin, or university_name independently
  const { rows: existing } = await sql`SELECT * FROM proposals WHERE id = ${id}`
  if (!existing[0]) throw createError({ statusCode: 404, message: 'Proposal not found' })

  const p = existing[0]
  const newContent = body.content !== undefined ? JSON.stringify(body.content) : JSON.stringify(p.content)
  const newStatus = body.status ?? p.status
  const newName = body.university_name ?? p.university_name

  let newPin = p.pin
  if (body.pin !== undefined) {
    if (!/^\d{4}$/.test(body.pin)) {
      throw createError({ statusCode: 400, message: 'PIN must be exactly 4 digits' })
    }
    newPin = await bcrypt.hash(body.pin, 12)
  }

  const { rows } = await sql`
    UPDATE proposals
    SET content = ${newContent}::jsonb,
        status = ${newStatus},
        pin = ${newPin},
        university_name = ${newName}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0]
})
