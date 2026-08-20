/**
 * Tests for auth endpoints and the admin middleware.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreateSession, mockValidateSession, mockClearSession, mockReadBody, mockCreateError } = vi.hoisted(() => ({
  mockCreateSession: vi.fn(),
  mockValidateSession: vi.fn(),
  mockClearSession: vi.fn(),
  mockReadBody: vi.fn(),
  mockCreateError: vi.fn((opts: { statusCode: number; message: string }) => {
    const e = new Error(opts.message) as any
    e.statusCode = opts.statusCode
    return e
  }),
}))

vi.mock('../../src/server/utils/session', () => ({
  createSession: mockCreateSession,
  validateSession: mockValidateSession,
  clearSession: mockClearSession,
}))

vi.mock('#imports', () => ({}))

vi.mock('h3', () => ({
  readBody: mockReadBody,
  createError: mockCreateError,
  deleteCookie: vi.fn(),
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws 401 on wrong password', async () => {
    mockReadBody.mockResolvedValue({ password: 'wrongpassword' })
    const { default: handler } = await import('../../src/server/api/auth/login.post')
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('does not create a session on wrong password', async () => {
    mockReadBody.mockResolvedValue({ password: 'wrongpassword' })
    const { default: handler } = await import('../../src/server/api/auth/login.post')
    try { await handler({} as any) } catch {}
    expect(mockCreateSession).not.toHaveBeenCalled()
  })

  it('creates session and returns ok:true on correct password', async () => {
    mockReadBody.mockResolvedValue({ password: 'secret123' })
    mockCreateSession.mockResolvedValue(undefined)
    const { default: handler } = await import('../../src/server/api/auth/login.post')
    const result = await handler({} as any)
    expect(mockCreateSession).toHaveBeenCalledOnce()
    expect(result).toEqual({ ok: true })
  })

  it('throws 401 when password is empty string', async () => {
    mockReadBody.mockResolvedValue({ password: '' })
    const { default: handler } = await import('../../src/server/api/auth/login.post')
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 401 })
  })
})

describe('server/middleware/admin-auth', () => {
  beforeEach(() => vi.clearAllMocks())

  it('allows non-admin paths through without calling validateSession', async () => {
    const { default: middleware } = await import('../../src/server/middleware/admin-auth')
    const event = { path: '/api/proposals/yale' } as any
    await expect(middleware(event)).resolves.not.toThrow()
    expect(mockValidateSession).not.toHaveBeenCalled()
  })

  it('allows root path through', async () => {
    const { default: middleware } = await import('../../src/server/middleware/admin-auth')
    const event = { path: '/' } as any
    await expect(middleware(event)).resolves.not.toThrow()
    expect(mockValidateSession).not.toHaveBeenCalled()
  })

  it('throws 401 for /api/admin paths when session is invalid', async () => {
    mockValidateSession.mockResolvedValue(false)
    const { default: middleware } = await import('../../src/server/middleware/admin-auth')
    const event = { path: '/api/admin/proposals' } as any
    await expect(middleware(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('allows /api/admin paths when session is valid', async () => {
    mockValidateSession.mockResolvedValue(true)
    const { default: middleware } = await import('../../src/server/middleware/admin-auth')
    const event = { path: '/api/admin/proposals' } as any
    await expect(middleware(event)).resolves.not.toThrow()
  })

  it('throws 401 for /api/admin/proposals/[id]/logs when unauthenticated', async () => {
    mockValidateSession.mockResolvedValue(false)
    const { default: middleware } = await import('../../src/server/middleware/admin-auth')
    const event = { path: '/api/admin/proposals/42/logs' } as any
    await expect(middleware(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('protects /api/admin/coach-library/push when unauthenticated', async () => {
    mockValidateSession.mockResolvedValue(false)
    const { default: middleware } = await import('../../src/server/middleware/admin-auth')
    const event = { path: '/api/admin/coach-library/push' } as any
    await expect(middleware(event)).rejects.toMatchObject({ statusCode: 401 })
  })
})
