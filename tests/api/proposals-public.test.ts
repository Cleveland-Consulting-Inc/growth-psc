/**
 * Tests for GET /api/proposals/[slug] — public proposal fetch.
 * Critical: PIN must NEVER be returned.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSql, mockGetRouterParam } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetRouterParam: vi.fn(),
}))

vi.mock('@vercel/postgres', () => ({ sql: mockSql }))
vi.mock('#imports', () => ({}))

vi.mock('h3', () => ({
  getRouterParam: mockGetRouterParam,
  createError: (opts: { statusCode: number; message: string }) => {
    const e = new Error(opts.message) as any
    e.statusCode = opts.statusCode
    return e
  },
}))

import handler from '../../src/server/api/proposals/[slug].get'

const PROPOSAL_ROW = {
  id: 1,
  slug: 'yale',
  university_name: 'Yale University',
  sport: 'tennis',
  status: 'live',
  content: { hero_headline: 'Hello' },
  created_at: '2026-01-01T00:00:00Z',
  // NOTE: pin is NOT included — the SQL SELECT explicitly omits it
}

describe('GET /api/proposals/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRouterParam.mockReturnValue('yale')
  })

  it('throws 404 when proposal does not exist', async () => {
    mockSql.mockResolvedValue({ rows: [] })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 404 })
  })

  it('returns proposal data when found', async () => {
    mockSql.mockResolvedValue({ rows: [PROPOSAL_ROW] })
    const result = await handler({} as any)
    expect(result).toBeTruthy()
    expect(result.slug).toBe('yale')
  })

  it('returns university_name field', async () => {
    mockSql.mockResolvedValue({ rows: [PROPOSAL_ROW] })
    const result = await handler({} as any)
    expect(result.university_name).toBe('Yale University')
  })

  it('returns content field', async () => {
    mockSql.mockResolvedValue({ rows: [PROPOSAL_ROW] })
    const result = await handler({} as any)
    expect(result.content).toEqual({ hero_headline: 'Hello' })
  })

  it('returns status field', async () => {
    mockSql.mockResolvedValue({ rows: [PROPOSAL_ROW] })
    const result = await handler({} as any)
    expect(['live', 'offline']).toContain(result.status)
  })

  it('CRITICAL: handler does not add a pin field to response', async () => {
    // The DB row itself has no pin (SELECT excludes it) — this confirms the handler
    // passes through rows[0] without injecting one
    mockSql.mockResolvedValue({ rows: [PROPOSAL_ROW] })
    const result = await handler({} as any)
    expect(result).not.toHaveProperty('pin')
  })

  it('CRITICAL REGRESSION: returns offline proposal (does not block on status)', async () => {
    // The public GET route should return offline proposals — the [slug]/index.vue
    // page uses this to show the "not available" screen. Access control is on verify.
    mockSql.mockResolvedValue({ rows: [{ ...PROPOSAL_ROW, status: 'offline' }] })
    const result = await handler({} as any)
    expect(result.status).toBe('offline')
  })
})
