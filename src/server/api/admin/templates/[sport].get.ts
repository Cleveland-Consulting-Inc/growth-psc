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

  const storage = useStorage('assets:templates')
  const keys = await storage.getKeys()
  const html = await storage.getItem<string>(filename)

  if (!html) {
    throw createError({ statusCode: 404, message: `Template file not found. Available keys: ${JSON.stringify(keys)}` })
  }

  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  return html
})
