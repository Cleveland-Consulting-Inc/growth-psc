import { H3Event, getCookie, setCookie, deleteCookie } from 'h3'

const COOKIE_NAME = 'psc-admin-session'

function sign(value: string, secret: string): string {
  // Simple HMAC-SHA256 signature using Web Crypto (available in Nitro/Node)
  return value // placeholder — replaced below with async version
}

export async function createSession(event: H3Event, secret: string) {
  const payload = JSON.stringify({ admin: true, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })
  const encoded = btoa(payload)
  const sig = await hmac(encoded, secret)
  setCookie(event, COOKIE_NAME, `${encoded}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })
}

export async function validateSession(event: H3Event, secret: string): Promise<boolean> {
  const cookie = getCookie(event, COOKIE_NAME)
  if (!cookie) return false
  const [encoded, sig] = cookie.split('.')
  if (!encoded || !sig) return false
  const expected = await hmac(encoded, secret)
  if (expected !== sig) return false
  try {
    const payload = JSON.parse(atob(encoded))
    return payload.admin === true && payload.exp > Date.now()
  } catch {
    return false
  }
}

export function clearSession(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}
