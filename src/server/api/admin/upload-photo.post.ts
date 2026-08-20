import { readMultipartFormData } from 'h3'
import { request as httpsRequest } from 'node:https'
import { request as httpRequest } from 'node:http'

const WEBDAV_HOST = 'premiersportscamps.com'
const WEBDAV_DOMAIN = 'growth.premiersportscamps.com'
const PUBLIC_BASE = 'https://growth.premiersportscamps.com/coaches'

function webdavPut(
  host: string,
  port: number,
  path: string,
  auth: string,
  contentType: string,
  body: Buffer,
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const useHttps = port === 2078
    const req = (useHttps ? httpsRequest : httpRequest)(
      {
        hostname: host,
        port,
        path,
        method: 'PUT',
        rejectUnauthorized: false, // cPanel often uses self-signed certs
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': contentType,
          'Content-Length': body.length,
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }))
      },
    )
    req.setTimeout(15000, () => { req.destroy(new Error('timeout')) })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function webdavMkcol(host: string, port: number, path: string, auth: string): Promise<void> {
  return new Promise((resolve) => {
    const useHttps = port === 2078
    const req = (useHttps ? httpsRequest : httpRequest)(
      {
        hostname: host,
        port,
        path,
        method: 'MKCOL',
        rejectUnauthorized: false,
        headers: { Authorization: `Basic ${auth}` },
      },
      () => resolve(),
    )
    req.setTimeout(10000, () => { req.destroy(); resolve() })
    req.on('error', () => resolve())
    req.end()
  })
}

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

  const fullUsername = username.includes('@') ? username : `${username}@${WEBDAV_DOMAIN}`
  const auth = Buffer.from(`${fullUsername}:${password}`).toString('base64')

  // Try SSL port first, fall back to non-SSL
  const ports = [2078, 2077]
  let lastError = ''

  for (const port of ports) {
    try {
      await webdavMkcol(WEBDAV_HOST, port, '/coaches/', auth)

      const ext = (filePart.filename ?? 'photo').split('.').pop()?.toLowerCase() ?? 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const result = await webdavPut(
        WEBDAV_HOST,
        port,
        `/coaches/${filename}`,
        auth,
        filePart.type ?? 'application/octet-stream',
        Buffer.from(filePart.data),
      )

      if (result.status >= 200 && result.status < 300) {
        return { url: `${PUBLIC_BASE}/${filename}` }
      }

      lastError = `port ${port}: HTTP ${result.status} — ${result.body.slice(0, 200)}`
    } catch (err: any) {
      lastError = `port ${port}: ${err?.message ?? err}`
    }
  }

  throw createError({ statusCode: 502, message: `WebDAV failed: ${lastError}` })
})
