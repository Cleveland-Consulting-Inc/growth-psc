import { readBody, createError, getHeader } from 'h3'
import { createSession } from '../../utils/session'
import { sql } from '../../utils/db'

const MAX_LOGIN_ATTEMPTS = 5
const WINDOW_MINUTES = 15

export default defineEventHandler(async (event) => {
  const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0].trim()
    ?? event.node.req.socket?.remoteAddress
    ?? 'unknown'

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
  const { rows: recentAttempts } = await sql`
    SELECT COUNT(*) AS cnt
    FROM login_attempts
    WHERE ip_address = ${ip}
      AND attempted_at > ${windowStart.toISOString()}
  `
  if (Number(recentAttempts[0]?.cnt ?? 0) >= MAX_LOGIN_ATTEMPTS) {
    throw createError({
      statusCode: 429,
      message: `Too many login attempts — try again in ${WINDOW_MINUTES} minutes.`,
    })
  }

  const { password } = await readBody(event)
  const config = useRuntimeConfig()

  if (password !== config.adminPassword) {
    await sql`INSERT INTO login_attempts (ip_address) VALUES (${ip})`
    throw createError({ statusCode: 401, message: 'Incorrect password' })
  }

  await createSession(event, config.sessionSecret)
  return { ok: true }
})
