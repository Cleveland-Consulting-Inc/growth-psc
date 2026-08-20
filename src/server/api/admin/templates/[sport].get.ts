import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SportSlug } from '~/server/utils/sports'

const TEMPLATE_FILES: Partial<Record<SportSlug, string>> = {
  tennis: 'Wilson_Tennis_Camps_2027.html',
}

export default defineEventHandler((event) => {
  const sport = getRouterParam(event, 'sport') as SportSlug

  const filename = TEMPLATE_FILES[sport]
  if (!filename) {
    throw createError({ statusCode: 404, message: 'No template for this sport yet.' })
  }

  const templatePath = resolve('src/server/templates', filename)
  const html = readFileSync(templatePath, 'utf-8')

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  return html
})
