import { createError } from 'h3'
import { validateSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const valid = await validateSession(event, config.sessionSecret)
  if (!valid) throw createError({ statusCode: 401, message: 'Unauthorized' })
  return { ok: true }
})
