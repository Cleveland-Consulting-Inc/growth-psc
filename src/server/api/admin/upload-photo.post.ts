import { readMultipartFormData } from 'h3'

const WEBDAV_HOST = 'https://premiersportscamps.com:2078'
const PUBLIC_BASE = 'https://growth.premiersportscamps.com/coaches'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file')
  if (!filePart?.data?.length) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  const username = process.env.WEBDAV_USERNAME
  const password = process.env.WEBDAV_PASSWORD
  if (!username || !password) {
    throw createError({ statusCode: 500, message: 'Upload not configured' })
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64')
  const headers = { Authorization: `Basic ${auth}` }

  // Ensure the coaches directory exists
  await fetch(`${WEBDAV_HOST}/coaches/`, {
    method: 'MKCOL',
    headers,
  }).catch(() => {})

  const ext = (filePart.filename ?? 'photo').split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const res = await fetch(`${WEBDAV_HOST}/coaches/${filename}`, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': filePart.type ?? 'application/octet-stream',
    },
    // @ts-ignore — node fetch accepts Buffer
    body: filePart.data,
    duplex: 'half',
  } as any)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw createError({ statusCode: 502, message: `WebDAV upload failed: ${res.status} ${text}` })
  }

  return { url: `${PUBLIC_BASE}/${filename}` }
})
