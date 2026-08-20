import { sql } from '@vercel/postgres'

export { sql }

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      version INTEGER NOT NULL DEFAULT 1,
      content JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS proposals (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      university_name TEXT NOT NULL,
      pin CHAR(4) NOT NULL,
      status TEXT NOT NULL DEFAULT 'live',
      content JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS access_logs (
      id SERIAL PRIMARY KEY,
      proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
      ip_address TEXT,
      user_agent TEXT,
      pin_correct BOOLEAN NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Seed one template row if none exists
  await sql`
    INSERT INTO templates (version, content)
    SELECT 1, ${JSON.stringify(defaultContent())}::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM templates)
  `
}

export function defaultContent() {
  return {
    partner_name: 'Wilson Tennis Camps',
    page_title: 'Wilson Tennis Camps | 2027 Partnership Opportunity',
    hero_eyebrow: '2027 Partnership Opportunity',
    hero_headline: 'Build a stronger tennis camp.',
    hero_subheadline: 'The Wilson Tennis Camps partnership gives tennis coaches the flexibility to run your camp your way — with the marketing, registration, and support you need behind the scenes.',
    hero_stat_number: '30+',
    hero_stat_label: 'years of camp experience',
    about_heading: 'Two experienced brands. One bigger opportunity.',
    about_psc_body: 'Founded in 1994, Premier Sports Camps has become one of the largest and most respected sports camp businesses in the United States. Serving more than 40,000 campers since our founding, we provide a multi-sport, multi-location operation that allows coaches to focus on an elite camp experience.',
    about_partner_body: 'Wilson brings generations of tennis experience, product innovation and the #1 brand in tennis. Together, that experience creates a stronger foundation for your camp.',
    about_stat_1_value: '1994',
    about_stat_1_label: 'Founded',
    about_stat_2_value: '40K+',
    about_stat_2_label: 'Campers since inception',
    about_stat_3_value: '30+',
    about_stat_3_label: 'Camp locations',
    network_heading: 'Built to grow where you are.',
    network_body: 'Wilson Tennis Camps partners with leading college coaches across the country. These are the coaches and programs helping shape the Wilson Tennis Camps experience.',
    network_coaches: 'David Roditi, TCU\nLee Taylor Walker, TCU\nGrant Chen, SMU\nMatt Hill, Arizona State\nAlison Swain, USC',
    services: '01|Marketing|Strategic campaigns and targeted outreach designed to build awareness and drive enrollment.\n02|Coach Support|Easy-to-use portal for camp management and planning.\n03|Administration|Streamlined operations and communication from registration through camp completion.\n04|Registration|Easy-to-use online registration and secure payment processing for families.\n05|Customer Service|Support for camper families before, during and after registration.\n06|Wilson Brand|Access to Wilson brand name and, depending on your package, demo rackets, prizes and giveaways.',
    package_1_name: 'Collegiate',
    package_1_subtitle: 'FULL-SERVICE PARTNERSHIP',
    package_1_percent: '25% of camp profit to PSC',
    package_1_tagline: 'Our top-tier partnership for programs looking to maximize marketing reach, enrollment and the Wilson camp experience.',
    package_1_features: 'Top-tier advertising & marketing\nWilson demo rackets provided\nFull range of Wilson giveaway prizes provided\nOnline registration for families\nCustomer service support',
    package_2_name: 'Classic',
    package_2_subtitle: 'ESSENTIAL PARTNERSHIP',
    package_2_percent: '20% of camp profit to PSC',
    package_2_tagline: 'A streamlined option for programs that want registration and customer service support with a lighter marketing footprint.',
    package_2_features: 'Limited marketing & advertising\nOnline registration for families\nCustomer service support\nWilson Brand Name T-Shirt provided for every camper',
    contact_1_name: 'Court Bowman',
    contact_1_email: 'court@premiersportscamps.com',
    contact_1_phone: '614-569-0099',
    contact_2_name: 'Marna Pawlowski',
    contact_2_email: 'marna@premiersportscamps.com',
    contact_2_phone: '614-388-8222',
    footer_year: '2027',
    cta_heading: "READY TO TALK?",
    cta_subheading: "Let's build a better camp.",
    cta_body: 'Have questions about partnering with Wilson Tennis Camps? Connect with our team to discuss your 2027 camp opportunity.',
  }
}
