import { getRouterParam, readBody, getHeader, setCookie } from 'h3'
import { sql } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const { pin } = await readBody(event)

  const { rows } = await sql`SELECT id, pin, status FROM proposals WHERE slug = ${slug}`
  const proposal = rows[0]

  if (!proposal) return { ok: false, reason: 'not_found' }
  if (proposal.status === 'offline') return { ok: false, reason: 'offline' }

  const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0].trim()
    ?? event.node.req.socket?.remoteAddress
    ?? null
  const ua = getHeader(event, 'user-agent') ?? null
  const correct = pin === proposal.pin

  await sql`
    INSERT INTO access_logs (proposal_id, ip_address, user_agent, pin_correct)
    VALUES (${proposal.id}, ${ip}, ${ua}, ${correct})
  `

  if (correct) {
    setCookie(event, `proposal-${slug}`, 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: `/${slug}`,
    })
    return { ok: true }
  }

  return { ok: false, reason: 'wrong_pin' }
})
