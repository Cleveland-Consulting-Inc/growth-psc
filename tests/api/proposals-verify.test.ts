/**
 * Tests for POST /api/proposals/[slug]/verify — PIN verification.
 * Critical security behaviors: access logging, cookie set/not-set, offline guard.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSql, mockSetCookie, mockGetHeader, mockGetRouterParam, mockReadBody } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockSetCookie: vi.fn(),
  mockGetHeader: vi.fn(),
  mockGetRouterParam: vi.fn(),
  mockReadBody: vi.fn(),
}))

vi.mock('@vercel/postgres', () => ({ sql: mockSql }))
vi.mock('#imports', () => ({}))

vi.mock('h3', () => ({
  getRouterParam: mockGetRouterParam,
  readBody: mockReadBody,
  getHeader: mockGetHeader,
  setCookie: mockSetCookie,
}))

import handler from '../../src/server/api/proposals/[slug]/verify.post'

const LIVE_PROPOSAL = { id: 42, pin: '1234', status: 'live' }
const OFFLINE_PROPOSAL = { id: 43, pin: '5678', status: 'offline' }

function makeEvent() {
  return {
    node: { req: { socket: { remoteAddress: '192.168.1.1' } } },
  } as any
}

describe('POST /api/proposals/[slug]/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRouterParam.mockReturnValue('yale')
    mockGetHeader.mockReturnValue(null)
    mockSql.mockImplementation((strings: TemplateStringsArray) => {
      const q = strings.join('?')
      if (q.includes('SELECT')) return Promise.resolve({ rows: [LIVE_PROPOSAL] })
      if (q.includes('INSERT')) return Promise.resolve({ rows: [] })
      return Promise.resolve({ rows: [] })
    })
  })

  // --- Not found ---
  it('returns ok:false reason:not_found when slug does not exist', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] })
    mockReadBody.mockResolvedValue({ pin: '1234' })

    const result = await handler(makeEvent())
    expect(result).toEqual({ ok: false, reason: 'not_found' })
  })

  it('does NOT write an access_log entry when proposal is not found', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] })
    mockReadBody.mockResolvedValue({ pin: '1234' })

    await handler(makeEvent())

    const insertCalled = mockSql.mock.calls.some((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('INSERT')
    )
    expect(insertCalled).toBe(false)
  })

  // --- Offline proposal ---
  it('returns ok:false reason:offline when proposal is offline', async () => {
    mockSql.mockResolvedValueOnce({ rows: [OFFLINE_PROPOSAL] })
    mockReadBody.mockResolvedValue({ pin: '5678' })

    const result = await handler(makeEvent())
    expect(result).toEqual({ ok: false, reason: 'offline' })
  })

  it('does NOT write an access_log when proposal is offline', async () => {
    mockSql.mockResolvedValueOnce({ rows: [OFFLINE_PROPOSAL] })
    mockReadBody.mockResolvedValue({ pin: '5678' })

    await handler(makeEvent())

    const insertCalled = mockSql.mock.calls.some((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('INSERT')
    )
    expect(insertCalled).toBe(false)
  })

  // --- Correct PIN ---
  it('returns ok:true on correct PIN', async () => {
    mockReadBody.mockResolvedValue({ pin: '1234' })
    const result = await handler(makeEvent())
    expect(result).toEqual({ ok: true })
  })

  it('sets session cookie on correct PIN', async () => {
    mockReadBody.mockResolvedValue({ pin: '1234' })
    await handler(makeEvent())
    expect(mockSetCookie).toHaveBeenCalledOnce()
    const [, name, value] = mockSetCookie.mock.calls[0]
    expect(name).toBe('proposal-yale')
    expect(value).toBe('granted')
  })

  it('cookie path is scoped to /[slug]', async () => {
    mockReadBody.mockResolvedValue({ pin: '1234' })
    await handler(makeEvent())
    const opts = mockSetCookie.mock.calls[0][3]
    expect(opts.path).toBe('/yale')
  })

  it('cookie is httpOnly', async () => {
    mockReadBody.mockResolvedValue({ pin: '1234' })
    await handler(makeEvent())
    const opts = mockSetCookie.mock.calls[0][3]
    expect(opts.httpOnly).toBe(true)
  })

  it('cookie maxAge is 8 hours (28800 seconds)', async () => {
    mockReadBody.mockResolvedValue({ pin: '1234' })
    await handler(makeEvent())
    const opts = mockSetCookie.mock.calls[0][3]
    expect(opts.maxAge).toBe(60 * 60 * 8)
  })

  it('logs correct PIN access with pin_correct=true', async () => {
    mockReadBody.mockResolvedValue({ pin: '1234' })
    await handler(makeEvent())

    const insertCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('INSERT')
    )
    expect(insertCall).toBeTruthy()
    expect(insertCall![4]).toBe(true) // pin_correct
  })

  // --- Wrong PIN ---
  it('returns ok:false reason:wrong_pin on incorrect PIN', async () => {
    mockReadBody.mockResolvedValue({ pin: '9999' })
    const result = await handler(makeEvent())
    expect(result).toEqual({ ok: false, reason: 'wrong_pin' })
  })

  it('does NOT set cookie on wrong PIN', async () => {
    mockReadBody.mockResolvedValue({ pin: '9999' })
    await handler(makeEvent())
    expect(mockSetCookie).not.toHaveBeenCalled()
  })

  it('logs wrong PIN attempt with pin_correct=false', async () => {
    mockReadBody.mockResolvedValue({ pin: '9999' })
    await handler(makeEvent())

    const insertCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('INSERT')
    )
    expect(insertCall).toBeTruthy()
    expect(insertCall![4]).toBe(false) // pin_correct
  })

  it('logs IP from x-forwarded-for header (first value when comma-separated)', async () => {
    mockReadBody.mockResolvedValue({ pin: '1234' })
    mockGetHeader.mockImplementation((_event: any, name: string) => {
      if (name === 'x-forwarded-for') return '10.0.0.1, 10.0.0.2, 10.0.0.3'
      return null
    })

    await handler(makeEvent())

    const insertCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('INSERT')
    )
    expect(insertCall![2]).toBe('10.0.0.1') // ip_address
  })

  it('logs user-agent from User-Agent header', async () => {
    mockReadBody.mockResolvedValue({ pin: '1234' })
    mockGetHeader.mockImplementation((_event: any, name: string) => {
      if (name === 'x-forwarded-for') return null
      if (name === 'user-agent') return 'Mozilla/5.0 TestBrowser'
      return null
    })

    await handler(makeEvent())

    const insertCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('INSERT')
    )
    expect(insertCall![3]).toBe('Mozilla/5.0 TestBrowser') // user_agent
  })
})
