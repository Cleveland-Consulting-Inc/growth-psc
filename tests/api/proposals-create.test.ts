/**
 * Tests for POST /api/admin/proposals — proposal creation validation.
 * Mocks @vercel/postgres so no live DB is required.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSql, mockReadBody } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockReadBody: vi.fn(),
}))

vi.mock('@vercel/postgres', () => ({ sql: mockSql }))
vi.mock('#imports', () => ({}))

vi.mock('h3', async () => {
  const actual = await vi.importActual<any>('h3')
  return {
    ...actual,
    readBody: mockReadBody,
    createError: (opts: { statusCode: number; message: string }) => {
      const e = new Error(opts.message) as any
      e.statusCode = opts.statusCode
      return e
    },
  }
})

import handler from '../../src/server/api/admin/proposals/index.post'

function makeInsertResult(proposal: any) {
  return { rows: [proposal] }
}

describe('POST /api/admin/proposals — input validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSql.mockImplementation((strings: TemplateStringsArray) => {
      const query = strings.join('?')
      if (query.includes('coach_library')) return Promise.resolve({ rows: [] })
      if (query.includes('INSERT')) return Promise.resolve(makeInsertResult({
        id: 1, slug: 'test', university_name: 'Test U', pin: '1234',
        status: 'live', sport: 'tennis', content: {}, created_at: new Date().toISOString(),
      }))
      return Promise.resolve({ rows: [] })
    })
  })

  it('throws 400 when university_name is missing', async () => {
    mockReadBody.mockResolvedValue({ slug: 'yale', pin: '1234', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when slug is missing', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', pin: '1234', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when pin is missing', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when sport is missing', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale', pin: '1234' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when PIN is 3 digits (too short)', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale', pin: '123', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when PIN is 5 digits (too long)', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale', pin: '12345', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when PIN contains letters', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale', pin: 'abcd', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when slug contains uppercase', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'Yale', pin: '1234', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when slug contains spaces', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale university', pin: '1234', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when slug contains underscore', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale_univ', pin: '1234', sport: 'tennis' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('accepts slug with hyphens (e.g. "unc-chapel-hill")', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'UNC', slug: 'unc-chapel-hill', pin: '5678', sport: 'tennis' })
    await expect(handler({} as any)).resolves.toBeTruthy()
  })

  it('accepts slug with numbers', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'MIT', slug: 'mit2027', pin: '0001', sport: 'lacrosse' })
    await expect(handler({} as any)).resolves.toBeTruthy()
  })

  it('throws 400 when sport is not a recognized slug', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale', pin: '1234', sport: 'hockey' })
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it.each(['tennis', 'lacrosse', 'volleyball', 'soccer'])('accepts valid sport: %s', async (sport) => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale', pin: '1234', sport })
    await expect(handler({} as any)).resolves.toBeTruthy()
  })

  it('seeds coaches from coach_library when entries exist', async () => {
    const libraryCoaches = [
      { name: 'Jane Smith', position: 'Head Coach', university: 'Yale', photo_url: '' },
    ]
    mockSql.mockImplementation((strings: TemplateStringsArray) => {
      const query = strings.join('?')
      if (query.includes('coach_library')) return Promise.resolve({ rows: libraryCoaches })
      if (query.includes('INSERT')) return Promise.resolve(makeInsertResult({
        id: 1, slug: 'yale', university_name: 'Yale University', pin: '1234',
        status: 'live', sport: 'tennis', content: {}, created_at: new Date().toISOString(),
      }))
      return Promise.resolve({ rows: [] })
    })

    mockReadBody.mockResolvedValue({ university_name: 'Yale University', slug: 'yale', pin: '1234', sport: 'tennis' })
    await handler({} as any)

    const insertCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('INSERT')
    )
    expect(insertCall).toBeTruthy()
    // INSERT VALUES (${slug}[1], ${university_name}[2], ${pin}[3], 'live', ${sport}[4], ${JSON.stringify(content)}[5])
    const contentArg = insertCall![5] as string
    const content = JSON.parse(contentArg)
    expect(content.network_coaches).toEqual(libraryCoaches)
  })

  it('default content does not include PIN', async () => {
    mockReadBody.mockResolvedValue({ university_name: 'Yale', slug: 'yale', pin: '9999', sport: 'tennis' })
    await handler({} as any)

    const insertCall = mockSql.mock.calls.find((call: any[]) =>
      (call[0] as TemplateStringsArray).join('?').includes('INSERT')
    )
    // Same interpolation order: slug[1], university_name[2], pin[3], sport[4], content[5]
    const contentArg = insertCall![5] as string
    const content = JSON.parse(contentArg)
    expect(content).not.toHaveProperty('pin')
  })
})
