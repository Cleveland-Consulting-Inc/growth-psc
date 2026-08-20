export type SportSlug = 'tennis' | 'lacrosse' | 'volleyball' | 'soccer'

export interface SportConfig {
  slug: SportSlug
  label: string
  brandName: string
  logoPath: string
  accentColor: string
  hasPhotos: boolean
}

export const SPORTS: Record<SportSlug, SportConfig> = {
  tennis: {
    slug: 'tennis',
    label: 'Tennis',
    brandName: 'Wilson Tennis Camps',
    logoPath: '/images/logos/wilson-tennis-camps-logo.png',
    accentColor: '#d7192f',
    hasPhotos: true,
  },
  lacrosse: {
    slug: 'lacrosse',
    label: 'Lacrosse',
    brandName: 'US Lacrosse Camps',
    logoPath: '/images/logos/us-lacrosse-camps-logo.png',
    accentColor: '#0057a8',
    hasPhotos: false,
  },
  volleyball: {
    slug: 'volleyball',
    label: 'Volleyball',
    brandName: 'US Volleyball Camps',
    logoPath: '/images/logos/us-volleyball-camps-logo.png',
    accentColor: '#003087',
    hasPhotos: false,
  },
  soccer: {
    slug: 'soccer',
    label: 'Soccer',
    brandName: 'Elite 11 Soccer Camps',
    logoPath: '/images/logos/elite11-soccer-camp-logo.png',
    accentColor: '#c8102e',
    hasPhotos: false,
  },
}

export function sportDefaultContent(sport: SportSlug) {
  const s = SPORTS[sport]
  return {
    partner_name: s.brandName,
    page_title: `${s.brandName} | 2027 Partnership Opportunity`,
    hero_eyebrow: '2027 Partnership Opportunity',
    hero_headline: 'Build a stronger camp.',
    hero_subheadline: `The ${s.brandName} partnership gives coaches the flexibility to run your camp your way — with the marketing, registration, and support you need behind the scenes.`,
    hero_stat_number: '30+',
    hero_stat_label: 'years of camp experience',
    about_heading: 'Two experienced brands. One bigger opportunity.',
    about_psc_body: 'Founded in 1994, Premier Sports Camps has become one of the largest and most respected sports camp businesses in the United States. Serving more than 40,000 campers since our founding, we provide a multi-sport, multi-location operation that allows coaches to focus on an elite camp experience.',
    about_partner_body: `${s.brandName} brings deep sport-specific experience and one of the most recognized brands in the game. Together, that experience creates a stronger foundation for your camp.`,
    about_stat_1_value: '1994',
    about_stat_1_label: 'Founded',
    about_stat_2_value: '40K+',
    about_stat_2_label: 'Campers since inception',
    about_stat_3_value: '30+',
    about_stat_3_label: 'Camp locations',
    network_heading: 'Built to grow where you are.',
    network_body: `${s.brandName} partners with leading college coaches across the country. These are the coaches and programs helping shape the ${s.brandName} experience.`,
    network_coaches: 'Coach Name, University\nCoach Name, University',
    services: '01|Marketing|Strategic campaigns and targeted outreach designed to build awareness and drive enrollment.\n02|Coach Support|Easy-to-use portal for camp management and planning.\n03|Administration|Streamlined operations and communication from registration through camp completion.\n04|Registration|Easy-to-use online registration and secure payment processing for families.\n05|Customer Service|Support for camper families before, during and after registration.\n06|Brand|Access to the brand name and, depending on your package, equipment, prizes and giveaways.',
    package_1_name: 'Collegiate',
    package_1_subtitle: 'FULL-SERVICE PARTNERSHIP',
    package_1_percent: '25% of camp profit to PSC',
    package_1_tagline: 'Our top-tier partnership for programs looking to maximize marketing reach, enrollment and the full camp experience.',
    package_1_features: 'Top-tier advertising & marketing\nEquipment provided\nFull range of giveaway prizes provided\nOnline registration for families\nCustomer service support',
    package_2_name: 'Classic',
    package_2_subtitle: 'ESSENTIAL PARTNERSHIP',
    package_2_percent: '20% of camp profit to PSC',
    package_2_tagline: 'A streamlined option for programs that want registration and customer service support with a lighter marketing footprint.',
    package_2_features: 'Limited marketing & advertising\nOnline registration for families\nCustomer service support\nBrand T-Shirt provided for every camper',
    cta_heading: 'READY TO TALK?',
    cta_subheading: "Let's build a better camp.",
    cta_body: `Have questions about partnering with ${s.brandName}? Connect with our team to discuss your 2027 camp opportunity.`,
    contact_1_name: 'Court Bowman',
    contact_1_email: 'court@premiersportscamps.com',
    contact_1_phone: '614-569-0099',
    contact_2_name: 'Marna Pawlowski',
    contact_2_email: 'marna@premiersportscamps.com',
    contact_2_phone: '614-388-8222',
    footer_year: '2027',
  }
}
