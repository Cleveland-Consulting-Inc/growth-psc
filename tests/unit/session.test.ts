import { describe, it, expect, vi, beforeEach } from 'vitest'

// --------------------------------------------------------------------------
// Minimal H3Event mock — only the cookie primitives session.ts uses
// --------------------------------------------------------------------------
function makeMockEvent() {
  const cookies: Record<string, string> = {}
  return {
    _cookies: cookies,
    node: { req: { socket: { remoteAddress: '127.0.0.1' } } },
  }
}

// We need to provide h3 stubs before importing session.ts
vi.mock('h3', () => {
  const store: Record<string, { value: string; opts: any }> = {}

  return {
    getCookie: (_event: any, name: string) => store[name]?.value ?? undefined,
    setCookie: (_event: any, name: string, value: string, opts: any) => {
      store[name] = { value, opts }
    },
    deleteCookie: (_event: any, name: string) => {
      delete store[name]
    },
    // expose internal store so tests can inspect it
    __store: store,
  }
})

import { createSession, validateSession, clearSession } from '../../src/server/utils/session'
import * as h3Mock from 'h3'

const SECRET = 'test-secret-must-be-at-least-32-chars!!'

describe('createSession / validateSession', () => {
  let event: any

  beforeEach(() => {
    event = makeMockEvent()
    // Clear the mock cookie store between tests
    const store = (h3Mock as any).__store
    for (const k of Object.keys(store)) delete store[k]
  })

  it('creates a session cookie that validates successfully', async () => {
    await createSession(event, SECRET)
    const valid = await validateSession(event, SECRET)
    expect(valid).toBe(true)
  })

  it('session cookie contains admin=true payload', async () => {
    await createSession(event, SECRET)
    const store = (h3Mock as any).__store
    const cookieValue = store['psc-admin-session']?.value
    expect(cookieValue).toBeTruthy()
    const [encoded] = cookieValue.split('.')
    const payload = JSON.parse(atob(encoded))
    expect(payload.admin).toBe(true)
  })

  it('session expires ~30 days from now', async () => {
    await createSession(event, SECRET)
    const store = (h3Mock as any).__store
    const cookieValue = store['psc-admin-session']?.value
    const [encoded] = cookieValue.split('.')
    const payload = JSON.parse(atob(encoded))
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
    // Allow ±5 seconds tolerance
    expect(payload.exp).toBeGreaterThan(Date.now() + thirtyDaysMs - 5000)
    expect(payload.exp).toBeLessThan(Date.now() + thirtyDaysMs + 5000)
  })

  it('rejects a tampered signature', async () => {
    await createSession(event, SECRET)
    const store = (h3Mock as any).__store
    const original = store['psc-admin-session'].value
    const [encoded] = original.split('.')
    store['psc-admin-session'].value = `${encoded}.deadbeef00000000`
    const valid = await validateSession(event, SECRET)
    expect(valid).toBe(false)
  })

  it('rejects a cookie with wrong secret', async () => {
    await createSession(event, SECRET)
    const valid = await validateSession(event, 'completely-different-secret-abc!!')
    expect(valid).toBe(false)
  })

  it('rejects a missing cookie', async () => {
    // No createSession called — cookie store is empty
    const valid = await validateSession(event, SECRET)
    expect(valid).toBe(false)
  })

  it('rejects an expired session', async () => {
    // Forge a cookie with exp in the past
    const payload = JSON.stringify({ admin: true, exp: Date.now() - 1000 })
    const encoded = btoa(payload)
    // Use HMAC to sign it properly so the signature check passes
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(encoded))
    const sig = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('')
    const store = (h3Mock as any).__store
    store['psc-admin-session'] = { value: `${encoded}.${sig}`, opts: {} }

    const valid = await validateSession(event, SECRET)
    expect(valid).toBe(false)
  })

  it('rejects a cookie with admin=false in payload', async () => {
    const payload = JSON.stringify({ admin: false, exp: Date.now() + 999999999 })
    const encoded = btoa(payload)
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(encoded))
    const sig = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('')
    const store = (h3Mock as any).__store
    store['psc-admin-session'] = { value: `${encoded}.${sig}`, opts: {} }

    const valid = await validateSession(event, SECRET)
    expect(valid).toBe(false)
  })

  it('rejects a malformed cookie (no dot separator)', async () => {
    const store = (h3Mock as any).__store
    store['psc-admin-session'] = { value: 'nodothere', opts: {} }
    const valid = await validateSession(event, SECRET)
    expect(valid).toBe(false)
  })

  it('clearSession deletes the cookie', async () => {
    await createSession(event, SECRET)
    clearSession(event)
    const store = (h3Mock as any).__store
    expect(store['psc-admin-session']).toBeUndefined()
  })
})
