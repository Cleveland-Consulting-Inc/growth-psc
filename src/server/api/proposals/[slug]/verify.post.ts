import { getRouterParam, readBody, getHeader, setCookie, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { sql } from '../../../utils/db'

const MAX_ATTEMPTS = 10
const WINDOW_MINUTES = 15

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const { pin } = await readBody(event)

  const { rows } = await sql`SELECT id, pin, status FROM proposals WHERE slug = ${slug}`
  const proposal = rows[0]

  // Uniform failure response — do not reveal whether slug exists
  if (!proposal || proposal.status === 'offline') return { ok: false }

  const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0].trim()
    ?? event.node.req.socket?.remoteAddress
    ?? null
  const ua = getHeader(event, 'user-agent') ?? null

  // Rate-limit: count failed attempts for this proposal + IP in the last WINDOW_MINUTES
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
  const { rows: recentFailures } = await sql`
    SELECT COUNT(*) AS cnt
    FROM access_logs
    WHERE proposal_id = ${proposal.id}
      AND ip_address = ${ip}
      AND pin_correct = false
      AND timestamp > ${windowStart.toISOString()}
  `
  if (Number(recentFailures[0]?.cnt ?? 0) >= MAX_ATTEMPTS) {
    throw createError({
      statusCode: 429,
      message: `Too many attempts — try again in ${WINDOW_MINUTES} minutes.`,
    })
  }

  const correct = await bcrypt.compare(pin, proposal.pin)

  await sql`
    INSERT INTO access_logs (proposal_id, ip_address, user_agent, pin_correct)
    VALUES (${proposal.id}, ${ip}, ${ua}, ${correct})
  `

  if (correct) {
    setCookie(event, `proposal-${slug}`, 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return { ok: true }
  }

  return { ok: false }
})
