import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { SportSlug } from '~/server/utils/sports'

const TEMPLATE_FILES: Partial<Record<SportSlug, string>> = {
  tennis: 'Wilson_Tennis_Camps_2027.html',
}

export default defineEventHandler(async (event) => {
  const sport = getRouterParam(event, 'sport') as SportSlug

  const filename = TEMPLATE_FILES[sport]
  if (!filename) {
    throw createError({ statusCode: 404, message: 'No template for this sport yet.' })
  }

  const filePath = resolve(process.cwd(), 'Original_html', filename)

  try {
    const html = await readFile(filePath, 'utf-8')
    setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return html
  } catch {
    throw createError({ statusCode: 404, message: 'Template file not found.' })
  }
})
