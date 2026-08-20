import type { SportSlug } from '~/server/utils/sports'

const TEMPLATE_URLS: Partial<Record<SportSlug, string>> = {
  tennis: '/templates/Wilson_Tennis_Camps_2027.html',
}

export default defineEventHandler((event) => {
  const sport = getRouterParam(event, 'sport') as SportSlug

  const url = TEMPLATE_URLS[sport]
  if (!url) {
    throw createError({ statusCode: 404, message: 'No template for this sport yet.' })
  }

  return sendRedirect(event, url)
})
