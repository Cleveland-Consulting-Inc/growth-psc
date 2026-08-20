import { readMultipartFormData } from 'h3'

const WEBDAV_HOST = 'https://premiersportscamps.com:2078'
const WEBDAV_DOMAIN = 'growth.premiersportscamps.com'
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

  // cPanel WebDAV sub-accounts authenticate as username@domain
  const fullUsername = username.includes('@') ? username : `${username}@${WEBDAV_DOMAIN}`
  const auth = Buffer.from(`${fullUsername}:${password}`).toString('base64')
  const headers = { Authorization: `Basic ${auth}` }

  // Ensure the coaches directory exists (ignore errors — it may already exist)
  await fetch(`${WEBDAV_HOST}/coaches/`, { method: 'MKCOL', headers }).catch(() => {})

  const ext = (filePart.filename ?? 'photo').split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  let res: Response
  try {
    res = await fetch(`${WEBDAV_HOST}/coaches/${filename}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': filePart.type ?? 'application/octet-stream',
      },
      body: filePart.data,
    } as any)
  } catch (err: any) {
    throw createError({ statusCode: 502, message: `WebDAV connection failed: ${err?.message ?? err}` })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw createError({
      statusCode: 502,
      message: `WebDAV upload failed (${res.status}): ${text.slice(0, 300)}`,
    })
  }

  return { url: `${PUBLIC_BASE}/${filename}` }
})
