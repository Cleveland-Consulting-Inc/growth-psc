/**
 * Tests for PUT /api/admin/proposals/[id] — proposal update.
 * Covers content patching, status toggle, PIN validation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSql, mockGetRouterParam, mockReadBody } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetRouterParam: vi.fn(),
  mockReadBody: vi.fn(),
}))

vi.mock('@vercel/postgres', () => ({ sql: mockSql }))
vi.mock('#imports', () => ({}))

vi.mock('h3', () => ({
  getRouterParam: mockGetRouterParam,
  readBody: mockReadBody,
  createError: (opts: { statusCode: number; message: string }) => {
    const e = new Error(opts.message) as any
    e.statusCode = opts.statusCode
    return e
  },
}))

import handler from '../../src/server/api/admin/proposals/[id].put'

const EXISTING_PROPOSAL = {
  id: 1, slug: 'yale', university_name: 'Yale University',
  pin: '1234', status: 'live', sport: 'tennis',
  content: { hero_headline: 'Original' }, created_at: '2026-01-01T00:00:00Z',
}

describe('PUT /api/admin/proposals/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRouterParam.mockReturnValue('1')
    mockSql.mockImplementation((strings: TemplateStringsArray) => {
      const q = strings.join('?')
      if (q.includes('SELECT')) return Promise.resolve({ rows: [EXISTING_PROPOSAL] })
      if (q.includes('UPDATE')) return Promise.resolve({ rows: [{ ...EXISTING_PROPOSAL }] })
      return Promise.resolve({ rows: [] })
    })
  })

  it('throws 404 when proposal does not exist', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] })
    mockReadBody.mockResolvedValue({ status: 'offline' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 404 })
  })

  it('throws 400 when new PIN is not 4 digits (too short)', async () => {
    mockReadBody.mockResolvedValue({ pin: '12' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when new PIN contains letters', async () => {
    mockReadBody.mockResolvedValue({ pin: 'abcd' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when new PIN is 5 digits (too long)', async () => {
    mockReadBody.mockResolvedValue({ pin: '12345' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('accepts valid 4-digit PIN update', async () => {
    mockReadBody.mockResolvedValue({ pin: '9999' })
    await expect(handler({} as any)).resolves.toBeTruthy()
  })

  it('preserves existing pin when not provided in patch', async () => {
    mockReadBody.mockResolvedValue({ status: 'offline' })
    await handler({} as any)

    const updateCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('UPDATE')
    )
    expect(updateCall![3]).toBe('1234') // falls back to existing pin
  })

  it('preserves existing university_name when not provided', async () => {
    mockReadBody.mockResolvedValue({ status: 'offline' })
    await handler({} as any)

    const updateCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('UPDATE')
    )
    expect(updateCall![4]).toBe('Yale University')
  })

  it('toggles status from live to offline', async () => {
    mockReadBody.mockResolvedValue({ status: 'offline' })
    await handler({} as any)

    const updateCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('UPDATE')
    )
    expect(updateCall![2]).toBe('offline')
  })

  it('toggles status from offline to live', async () => {
    mockSql.mockReset()
    mockSql.mockImplementation((strings: TemplateStringsArray) => {
      const q = strings.join('?')
      if (q.includes('SELECT')) return Promise.resolve({ rows: [{ ...EXISTING_PROPOSAL, status: 'offline' }] })
      if (q.includes('UPDATE')) return Promise.resolve({ rows: [{ ...EXISTING_PROPOSAL, status: 'live' }] })
      return Promise.resolve({ rows: [] })
    })
    mockReadBody.mockResolvedValue({ status: 'live' })

    await handler({} as any)

    const updateCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('UPDATE')
    )
    expect(updateCall![2]).toBe('live')
  })

  it('allows updating content while preserving other fields', async () => {
    const newContent = { hero_headline: 'Updated Headline' }
    mockReadBody.mockResolvedValue({ content: newContent })
    await handler({} as any)

    const updateCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('UPDATE')
    )
    const contentArg = JSON.parse(updateCall![1] as string)
    expect(contentArg.hero_headline).toBe('Updated Headline')
    // status and pin unchanged
    expect(updateCall![2]).toBe('live')
    expect(updateCall![3]).toBe('1234')
  })

  it('returns the updated proposal row', async () => {
    mockReadBody.mockResolvedValue({ status: 'offline' })
    const result = await handler({} as any)
    expect(result).toBeTruthy()
    expect(result).toHaveProperty('id')
  })
})
