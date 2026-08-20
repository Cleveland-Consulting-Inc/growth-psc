import { readBody, createError } from 'h3'
import { createSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const { password } = await readBody(event)
  const config = useRuntimeConfig()

  if (password !== config.adminPassword) {
    throw createError({ statusCode: 401, message: 'Incorrect password' })
  }

  await createSession(event, config.sessionSecret)
  return { ok: true }
})
