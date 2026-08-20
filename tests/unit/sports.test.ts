import { describe, it, expect } from 'vitest'
import { SPORTS, sportDefaultContent } from '../../src/server/utils/sports'
import type { SportSlug } from '../../src/server/utils/sports'

const ALL_SPORTS: SportSlug[] = ['tennis', 'lacrosse', 'volleyball', 'soccer']

describe('SPORTS registry', () => {
  it('has exactly four sports', () => {
    expect(Object.keys(SPORTS)).toHaveLength(4)
  })

  it.each(ALL_SPORTS)('%s has all required config fields', (sport) => {
    const s = SPORTS[sport]
    expect(s.slug).toBe(sport)
    expect(s.label).toBeTruthy()
    expect(s.brandName).toBeTruthy()
    expect(s.logoPath).toMatch(/^\/images\/logos\/.+\.png$/)
    expect(s.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(typeof s.hasPhotos).toBe('boolean')
  })
})

describe('sportDefaultContent()', () => {
  it.each(ALL_SPORTS)('%s — returns all required top-level keys', (sport) => {
    const c = sportDefaultContent(sport)

    const requiredKeys = [
      'partner_name', 'page_title', 'hero_eyebrow', 'hero_headline',
      'hero_subheadline', 'hero_stat_number', 'hero_stat_label',
      'about_heading', 'about_psc_body', 'about_partner_body',
      'about_stat_1_value', 'about_stat_1_label',
      'about_stat_2_value', 'about_stat_2_label',
      'about_stat_3_value', 'about_stat_3_label',
      'network_heading', 'network_body', 'network_coaches',
      'services',
      'package_1_name', 'package_1_subtitle', 'package_1_percent',
      'package_1_tagline', 'package_1_features',
      'package_2_name', 'package_2_subtitle', 'package_2_percent',
      'package_2_tagline', 'package_2_features',
      'cta_heading', 'cta_subheading', 'cta_body',
      'contact_1_name', 'contact_1_email', 'contact_1_phone',
      'contact_2_name', 'contact_2_email', 'contact_2_phone',
      'footer_year',
    ]

    for (const key of requiredKeys) {
      expect(c, `missing key: ${key}`).toHaveProperty(key)
    }
  })

  it.each(ALL_SPORTS)('%s — partner_name matches SPORTS registry brandName', (sport) => {
    const c = sportDefaultContent(sport)
    expect(c.partner_name).toBe(SPORTS[sport].brandName)
  })

  it.each(ALL_SPORTS)('%s — network_coaches is a non-empty array', (sport) => {
    const c = sportDefaultContent(sport)
    expect(Array.isArray(c.network_coaches)).toBe(true)
    expect(c.network_coaches.length).toBeGreaterThan(0)
  })

  it.each(ALL_SPORTS)('%s — each coach entry has name, position, university, photo_url', (sport) => {
    const c = sportDefaultContent(sport)
    for (const coach of c.network_coaches) {
      expect(coach).toHaveProperty('name')
      expect(coach).toHaveProperty('position')
      expect(coach).toHaveProperty('university')
      expect(coach).toHaveProperty('photo_url')
    }
  })

  it('does NOT include a "pin" field in content (PIN must never be in content blob)', () => {
    for (const sport of ALL_SPORTS) {
      const c = sportDefaultContent(sport)
      expect(c).not.toHaveProperty('pin')
    }
  })

  it('contact emails are PSC addresses', () => {
    for (const sport of ALL_SPORTS) {
      const c = sportDefaultContent(sport)
      expect(c.contact_1_email).toMatch(/@premiersportscamps\.com$/)
      expect(c.contact_2_email).toMatch(/@premiersportscamps\.com$/)
    }
  })

  it('services field is pipe-delimited with 6 entries', () => {
    for (const sport of ALL_SPORTS) {
      const c = sportDefaultContent(sport)
      const lines = c.services.split('\n')
      expect(lines).toHaveLength(6)
      for (const line of lines) {
        const parts = line.split('|')
        expect(parts).toHaveLength(3) // number | name | description
      }
    }
  })

  it('package percentages reference "PSC"', () => {
    for (const sport of ALL_SPORTS) {
      const c = sportDefaultContent(sport)
      expect(c.package_1_percent).toContain('PSC')
      expect(c.package_2_percent).toContain('PSC')
    }
  })

  it('each sport produces independent content objects (no shared reference)', () => {
    const a = sportDefaultContent('tennis')
    const b = sportDefaultContent('tennis')
    a.hero_headline = 'MUTATED'
    expect(b.hero_headline).not.toBe('MUTATED')
  })
})

describe('SPORTS logo paths', () => {
  it('tennis logo path is wilson-tennis-camps-logo.png', () => {
    expect(SPORTS.tennis.logoPath).toBe('/images/logos/wilson-tennis-camps-logo.png')
  })
  it('lacrosse logo path is us-lacrosse-camps-logo.png', () => {
    expect(SPORTS.lacrosse.logoPath).toBe('/images/logos/us-lacrosse-camps-logo.png')
  })
  it('volleyball logo path is us-volleyball-camps-logo.png', () => {
    expect(SPORTS.volleyball.logoPath).toBe('/images/logos/us-volleyball-camps-logo.png')
  })
  it('soccer logo path is elite11-soccer-camp-logo.png', () => {
    expect(SPORTS.soccer.logoPath).toBe('/images/logos/elite11-soccer-camp-logo.png')
  })
})
