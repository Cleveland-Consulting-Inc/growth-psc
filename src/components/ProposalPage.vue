<template>
  <div class="proposal" :style="`--accent: ${sport.accentColor}`">

    <!-- NAV -->
    <header class="site-header">
      <div class="container">
        <img :src="sport.logoPath" :alt="sport.brandName" class="brand-logo" />
        <nav class="site-nav">
          <a href="#about">About</a>
          <a href="#value">What We Provide</a>
          <a href="#fees">Packages</a>
          <a href="#contact">Contact</a>
          <a href="#contact" class="nav-cta">Let's Talk <span>↗</span></a>
        </nav>
      </div>
    </header>

    <!-- HERO -->
    <section id="top" class="hero" :class="{ 'hero-photo': sport.hasPhotos }">
      <div v-if="sport.hasPhotos" class="hero-image">
        <img src="/images/sports/tennis/hero.jpg" alt="" />
      </div>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <p class="eyebrow red">{{ c.hero_eyebrow }}</p>
        <h1>{{ c.hero_headline }}</h1>
        <p class="hero-copy">{{ c.hero_subheadline }}</p>
        <div class="hero-actions">
          <a href="#fees" class="button button-accent">Explore the packages</a>
          <a href="#contact" class="text-link">Start a conversation <span>→</span></a>
        </div>
        <div class="hero-stats-row">
          <div class="hero-stat-item"><strong>30+</strong><span>Years of Camp<br>Experience</span></div>
          <span class="hero-stat-divider">|</span>
          <div class="hero-stat-item"><strong>40K+</strong><span>Campers<br>Served</span></div>
          <span class="hero-stat-divider">|</span>
          <div class="hero-stat-item"><strong>30+</strong><span>Camp<br>Locations</span></div>
        </div>
      </div>
    </section>

    <!-- MARQUEE BANNER -->
    <div class="marquee-banner">
      <span>More Campers.</span>
      <span class="banner-divider">|</span>
      <span>Less Work.</span>
      <span class="banner-divider">|</span>
      <span>Your Camp.</span>
    </div>

    <!-- ABOUT -->
    <section id="about" class="section-light two-col">
      <div class="container grid-2col">
        <div v-if="sport.hasPhotos" class="photo-card">
          <img src="/images/sports/tennis/about.jpg" alt="" />
        </div>
        <div v-else class="photo-placeholder"></div>
        <div class="content-block">
          <p class="eyebrow">The Partnership</p>
          <h2>{{ c.about_heading }}</h2>
          <div class="brand-story">
            <div class="story-item">
              <h3>Premier Sports Camps</h3>
              <p>{{ c.about_psc_body }}</p>
            </div>
            <div class="story-item">
              <h3>{{ sport.brandName }}</h3>
              <p>{{ c.about_partner_body }}</p>
            </div>
          </div>
          <div class="metric-row">
            <div>
              <strong>{{ c.about_stat_1_value }}</strong>
              <span>{{ c.about_stat_1_label }}</span>
            </div>
            <div>
              <strong>{{ c.about_stat_2_value }}</strong>
              <span>{{ c.about_stat_2_label }}</span>
            </div>
            <div>
              <strong>{{ c.about_stat_3_value }}</strong>
              <span>{{ c.about_stat_3_label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COACH NETWORK -->
    <section class="section-dark camp-network">
      <div class="container network-grid">
        <div>
          <p class="eyebrow">A National Coach Network</p>
          <h2>{{ c.network_heading }}</h2>
          <p>{{ c.network_body }}</p>
        </div>
        <div>
          <div class="coach-cards">
            <div v-for="coach in coaches" :key="coach.name + coach.university" class="coach-card">
              <div class="coach-photo">
                <img
                  v-if="coach.photo_url"
                  :src="coach.photo_url"
                  :alt="coach.name"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
                <div v-else class="coach-photo-placeholder"></div>
              </div>
              <p class="coach-name">{{ coach.name }}</p>
              <p class="coach-position">{{ coach.position }}</p>
              <p class="coach-university">{{ coach.university }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SERVICES -->
    <section id="value" class="section-light value">
      <div class="container">
        <div class="section-heading centered">
          <p class="eyebrow">What We Provide</p>
          <h2>Everything behind the scenes, so you can focus on camp.</h2>
        </div>
        <div class="service-grid">
          <div v-for="svc in services" :key="svc.number" class="service-card">
            <span class="svc-num">{{ svc.number }}</span>
            <h3>{{ svc.heading }}</h3>
            <p>{{ svc.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SPLIT IMAGE -->
    <div v-if="sport.hasPhotos" class="split-image-wrap">
      <img src="/images/sports/tennis/split.jpg" alt="" />
    </div>

    <!-- OUR APPROACH -->
    <section class="section-light approach-section">
      <div class="container">
        <div class="section-heading centered">
          <p class="eyebrow red">Our Approach</p>
          <h2>Your camp.<br><span class="h2-muted">Your decisions.</span></h2>
          <p>We believe the best camp partnerships are built around the coach and the program — not around a one-size-fits-all model.</p>
        </div>
        <div class="approach-grid">
          <div class="approach-card approach-solo">
            <p class="approach-kicker">Going It Alone</p>
            <h3>You work by yourself.</h3>
            <div class="approach-row"><span class="approach-icon muted">✗</span><p><b>You market your own camp.</b><br>Outreach, paid ads, and enrollment are entirely on you — no brand, no network, no support.</p></div>
            <div class="approach-row"><span class="approach-icon muted">✗</span><p><b>You build and manage registration.</b><br>Source, set up, and maintain your own registration system for every family that signs up.</p></div>
            <div class="approach-row"><span class="approach-icon muted">✗</span><p><b>You source your own insurance.</b><br>Locate, negotiate, and carry your own liability coverage and handle all compliance requirements.</p></div>
            <div class="approach-row"><span class="approach-icon muted">✗</span><p><b>You field every customer call.</b><br>All parent inquiries and family support land directly on you and your staff.</p></div>
          </div>
          <div class="approach-card approach-other">
            <p class="approach-kicker">One-Size-Fits-All Models</p>
            <h3>You work for the model.</h3>
            <div class="approach-row"><span class="approach-icon muted">×</span><p><b>Location is dictated.</b><br>Camp operations may be built around the provider's model rather than your program.</p></div>
            <div class="approach-row"><span class="approach-icon muted">×</span><p><b>Dates are dictated.</b><br>Schedules may be determined by a larger system or regional calendar.</p></div>
            <div class="approach-row"><span class="approach-icon muted">×</span><p><b>Pricing is dictated.</b><br>Less flexibility to shape the camp around your market and goals.</p></div>
            <div class="approach-row"><span class="approach-icon muted">×</span><p><b>Less flexibility.</b><br>A standardized structure can make it harder to tailor the partnership to your needs.</p></div>
          </div>
          <div class="approach-card approach-wilson">
            <p class="approach-kicker">{{ sport.brandName }}</p>
            <h3>We work for you.</h3>
            <div class="approach-row"><span class="approach-icon accent">✓</span><p><b>You choose the location.</b><br>Build the camp around the courts and facilities that work for your program.</p></div>
            <div class="approach-row"><span class="approach-icon accent">✓</span><p><b>You choose the dates.</b><br>Set your schedule around your team's calendar and your university's needs.</p></div>
            <div class="approach-row"><span class="approach-icon accent">✓</span><p><b>You shape the camp.</b><br>Keep ownership of the experience, coaching vision and program decisions.</p></div>
            <div class="approach-row"><span class="approach-icon accent">✓</span><p><b>You choose the package.</b><br>Take the level of marketing and support that makes sense for your camp.</p></div>
            <div class="approach-row"><span class="approach-icon accent">✓</span><p><b>You set the pricing.</b><br>Price your camp for your market — no mandated fee structures or rate cards imposed from above.</p></div>
          </div>
        </div>
      </div>
    </section>

    <!-- PACKAGES -->
    <section id="fees" class="section-dark fees">
      <div class="container">
        <div class="section-heading centered light-heading">
          <p class="eyebrow">2027 Camp Packages</p>
          <h2>Choose the support that fits your camp.</h2>
          <p>Two partnership levels give you the flexibility to decide how much marketing, product and administrative support you want.</p>
        </div>
        <div class="packages-grid">
          <div class="package-card package-classic">
            <p class="pkg-subtitle">{{ c.package_2_subtitle }}</p>
            <h3>{{ c.package_2_name }}</h3>
            <div class="pkg-rate"><strong>80%</strong><span>of camp revenue stays with you</span></div>
            <p class="pkg-tagline">{{ c.package_2_tagline }}</p>
            <ul>
              <li v-for="feat in pkg2Features" :key="feat">{{ feat }}</li>
            </ul>
            <a href="#contact" class="button button-light pkg-cta">Talk about {{ c.package_2_name }}</a>
          </div>
          <div class="package-card package-primary">
            <p class="pkg-subtitle">{{ c.package_1_subtitle }}</p>
            <h3>{{ c.package_1_name }}</h3>
            <div class="pkg-rate"><strong>75%</strong><span>of camp revenue stays with you</span></div>
            <p class="pkg-tagline">{{ c.package_1_tagline }}</p>
            <ul>
              <li v-for="feat in pkg1Features" :key="feat">{{ feat }}</li>
            </ul>
            <a href="#contact" class="button button-accent pkg-cta">Talk about {{ c.package_1_name }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- FULL BLEED PHOTO -->
    <div v-if="sport.hasPhotos" class="fullbleed-wrap">
      <img src="/images/sports/tennis/fullbleed.jpg" alt="" />
      <div class="fullbleed-overlay"></div>
    </div>

    <!-- CONTACT -->
    <section id="contact" class="section-dark contact-section">
      <div class="container contact-grid">
        <div>
          <p class="eyebrow red">{{ c.cta_heading }}</p>
          <h2>{{ c.cta_subheading }}</h2>
          <p>{{ c.cta_body }}</p>
        </div>
        <div class="contact-cards">
          <div class="contact-card">
            <strong>{{ c.contact_1_name }}</strong>
            <a :href="`mailto:${c.contact_1_email}`">{{ c.contact_1_email }}</a>
            <span>{{ c.contact_1_phone }}</span>
          </div>
          <div class="contact-card">
            <strong>{{ c.contact_2_name }}</strong>
            <a :href="`mailto:${c.contact_2_email}`">{{ c.contact_2_email }}</a>
            <span>{{ c.contact_2_phone }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="site-footer">
      <div class="container footer-inner">
        <img :src="sport.logoPath" :alt="sport.brandName" class="footer-logo" />
        <p>© {{ c.footer_year }} {{ sport.brandName }}</p>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import type { SportConfig } from '~/server/utils/sports'

const props = defineProps<{
  proposal: any
  sport: SportConfig
}>()

const c = computed(() => props.proposal.content ?? {})

const coaches = computed(() => {
  const raw = c.value.network_coaches
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split('\n').filter(Boolean).map((line: string) => {
      const [name, university] = line.split(',').map((s: string) => s.trim())
      return { name: name ?? '', position: '', university: university ?? '', photo_url: '' }
    })
  }
  return []
})

const services = computed(() =>
  (c.value.services ?? '').split('\n').filter(Boolean).map((line: string) => {
    const [number, heading, body] = line.split('|')
    return { number, heading, body }
  })
)

const pkg1Features = computed(() =>
  (c.value.package_1_features ?? '').split('\n').filter(Boolean)
)

const pkg2Features = computed(() =>
  (c.value.package_2_features ?? '').split('\n').filter(Boolean)
)
</script>

<style scoped>
.proposal {
  --accent: #d7192f;
  --black: #080808;
  --ink: #151515;
  --white: #fff;
  --paper: #f7f7f5;
  --muted: #686868;
  --line: #deded9;
  --max: 1240px;
  font-family: Arial, Helvetica, sans-serif;
  background: var(--paper);
  color: var(--ink);
  line-height: 1.55;
}

.container { width: min(var(--max), calc(100% - 48px)); margin: auto; }

/* NAV */
.site-header {
  position: sticky; top: 0; z-index: 50; height: 76px;
  background: #fff;
  display: flex; align-items: center; padding: 0 4vw;
  border-bottom: 1px solid var(--line);
}
.site-header .container { display: flex; align-items: center; width: 100%; }
.brand-logo { height: 36px; object-fit: contain; }
.site-nav { display: flex; gap: 24px; margin-left: auto; align-items: center; }
.site-nav a { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: var(--ink); text-decoration: none; }
.site-nav a:hover { color: var(--accent); }
.nav-cta { background: var(--accent); color: #fff !important; padding: 10px 16px; border-radius: 99px; font-weight: 800; }
.nav-cta:hover { opacity: .88; }
.nav-cta span { margin-left: 6px; }

/* HERO */
.hero { min-height: 760px; position: relative; overflow: hidden; display: flex; align-items: center; background: #000; }
.hero-photo .hero-image { position: absolute; inset: 0; display: flex; justify-content: flex-end; }
.hero-photo .hero-image img { width: 58%; height: 100%; object-fit: contain; object-position: center right; filter: saturate(.9); }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg,rgba(0,0,0,.98) 0%,rgba(0,0,0,.93) 28%,rgba(0,0,0,.48) 52%,rgba(0,0,0,.04) 78%), linear-gradient(0deg,rgba(0,0,0,.55),transparent 45%); }
.hero-content { position: relative; z-index: 2; padding-top: 80px; padding-bottom: 100px; }
.hero-stat { position: absolute; right: 4vw; bottom: 42px; z-index: 2; display: flex; align-items: flex-end; gap: 12px; }
.hero-stat strong { font: 700 72px/1 'Arial Narrow', Impact, Arial, sans-serif; color: var(--accent); }
.hero-stat span { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; line-height: 1.2; color: #ccc; }

.eyebrow { font-size: 11px; letter-spacing: .2em; font-weight: 800; color: #bdbdbd; margin: 0 0 18px; text-transform: uppercase; }
.eyebrow.red { color: var(--accent); }
h1, h2 { font-family: 'Arial Narrow', Impact, Arial, sans-serif; text-transform: uppercase; letter-spacing: -.02em; line-height: .95; margin: 0; }
h1 { font-size: clamp(60px, 8vw, 108px); max-width: 850px; color: #fff; }
h2 { font-size: clamp(44px, 5.2vw, 70px); }
.hero-copy { font-size: 18px; max-width: 590px; color: #ddd; margin: 30px 0; }
.hero-actions { display: flex; gap: 28px; align-items: center; }

.button { display: inline-block; border-radius: 99px; padding: 14px 22px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; text-decoration: none; }
.button-accent { background: var(--accent); color: #fff; }
.button-dark { background: var(--black); color: #fff; }
.text-link { font-size: 13px; font-weight: 700; color: #fff; text-decoration: none; }
.text-link span { color: var(--accent); font-size: 20px; margin-left: 7px; }

/* ABOUT */
.section-light { background: var(--paper); }
.section-dark { background: var(--black); color: var(--white); }
.two-col { padding: 100px 0; }
.grid-2col { display: grid; grid-template-columns: .9fr 1.1fr; gap: 8vw; align-items: center; }
.photo-card { border-radius: 2px; overflow: hidden; }
.photo-card img { width: 100%; height: 580px; object-fit: cover; }
.photo-placeholder { background: #e0e0da; border-radius: 2px; height: 580px; }
.brand-story { margin: 32px 0; }
.story-item { padding: 20px 0; border-top: 1px solid var(--line); }
.story-item:last-child { border-bottom: 1px solid var(--line); }
h3 { margin: 0 0 8px; font-size: 17px; }
.story-item p { color: #5e5e5e; font-size: 15px; max-width: 720px; margin: 0; }
.metric-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px; }
.metric-row div { border-left: 3px solid var(--accent); padding-left: 15px; }
.metric-row strong { display: block; font: 700 36px/1 'Arial Narrow', Impact, Arial, sans-serif; }
.metric-row span { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }

/* NETWORK */
.camp-network { padding: 100px 0; }
.network-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
.camp-network h2 { font-size: clamp(48px, 5.5vw, 76px); margin-bottom: 20px; color: #fff; }
.camp-network p:not(.eyebrow) { color: #aaa; max-width: 520px; }
.coach-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 28px; }
.coach-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
.coach-photo { width: 96px; height: 96px; border-radius: 50%; overflow: hidden; margin-bottom: 12px; background: #333; border: 2px solid var(--accent, #d7192f); }
.coach-photo img { width: 100%; height: 100%; object-fit: cover; }
.coach-photo-placeholder { width: 100%; height: 100%; background: #444; }
.coach-name { font-size: 13px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px; }
.coach-position { font-size: 11px; color: #aaa; margin: 0 0 2px; }
.coach-university { font-size: 12px; color: #ccc; margin: 0; }

/* SERVICES */
.value { padding: 100px 0; }
.section-heading { margin-bottom: 55px; }
.section-heading.centered { text-align: center; }
.section-heading h2 { color: var(--ink); }
.section-heading p:not(.eyebrow) { color: var(--muted); margin: 16px auto 0; max-width: 600px; }
.service-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: var(--line); border: 1px solid var(--line); }
.service-card { background: var(--paper); padding: 36px 28px; }
.svc-num { display: block; font: 700 11px/1 'Arial Narrow', Arial, sans-serif; letter-spacing: .14em; color: var(--accent); margin-bottom: 16px; }
.service-card h3 { font-size: 18px; margin: 0 0 10px; }
.service-card p { font-size: 14px; color: var(--muted); margin: 0; }

/* SPLIT / FULLBLEED */
.split-image-wrap { height: 480px; overflow: hidden; }
.split-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
.fullbleed-wrap { position: relative; height: 520px; overflow: hidden; }
.fullbleed-wrap img { width: 100%; height: 100%; object-fit: cover; }
.fullbleed-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.2) 60%); }

/* PACKAGES */
.fees { padding: 100px 0; }
.fees h2 { color: var(--ink); }
.packages-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 48px; }
.package-card { border: 1px solid var(--line); border-radius: 2px; padding: 40px 36px; background: #fff; }
.package-primary { border-color: var(--accent); border-top: 4px solid var(--accent); }
.pkg-subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: .18em; color: var(--muted); margin: 0 0 12px; }
.package-card h3 { font-family: 'Arial Narrow', Arial, sans-serif; font-size: 40px; text-transform: uppercase; margin: 0 0 10px; }
.pkg-percent { font-size: 13px; color: var(--muted); margin: 0 0 18px; }
.pkg-tagline { font-size: 14px; color: var(--ink); margin: 0 0 24px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
.package-card ul { list-style: none; padding: 0; margin: 0 0 32px; }
.package-card ul li { font-size: 14px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.package-card ul li::before { content: '✓ '; color: var(--accent); font-weight: 700; }
.pkg-cta { display: block; text-align: center; }

/* CONTACT */
.contact-section { padding: 100px 0; }
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.contact-section h2 { color: #fff; font-size: clamp(40px, 5vw, 68px); margin-bottom: 20px; }
.contact-section p:not(.eyebrow) { color: #aaa; font-size: 15px; }
.contact-cards { display: flex; flex-direction: column; gap: 20px; }
.contact-card { border: 1px solid #333; border-radius: 2px; padding: 28px; display: flex; flex-direction: column; gap: 6px; }
.contact-card strong { font-size: 18px; color: #fff; }
.contact-card a { font-size: 14px; color: var(--accent); text-decoration: none; }
.contact-card span { font-size: 14px; color: #aaa; }

/* FOOTER */
.site-footer { background: #fff; padding: 32px 0; border-top: 1px solid var(--line); }
.footer-inner { display: flex; align-items: center; gap: 24px; }
.footer-logo { height: 28px; object-fit: contain; }
.site-footer p { font-size: 12px; color: var(--muted); margin: 0; }

/* HERO STATS ROW */
.hero-stats-row { display: flex; align-items: center; gap: 28px; margin-top: 36px; flex-wrap: wrap; }
.hero-stat-item { display: flex; align-items: baseline; gap: 8px; }
.hero-stat-item strong { font: 700 32px/1 'Arial Narrow', Impact, Arial, sans-serif; color: var(--accent); }
.hero-stat-item span { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #bbb; line-height: 1.3; }
.hero-stat-divider { color: #444; font-size: 20px; font-weight: 300; }

/* MARQUEE BANNER */
.marquee-banner { background: var(--accent); padding: 20px 32px; display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap; position: sticky; top: 76px; z-index: 49; }
.marquee-banner span { font: 700 clamp(20px, 2.8vw, 34px)/1 'Arial Narrow', Impact, Arial, sans-serif; text-transform: uppercase; letter-spacing: -.01em; color: #fff; white-space: nowrap; }
.banner-divider { font-weight: 300 !important; font-size: 24px !important; color: rgba(255,255,255,.35) !important; }

/* OUR APPROACH */
.approach-section { padding: 100px 0; }
.approach-section h2 { color: var(--ink); }
.h2-muted { color: #a4a4a4; }
.approach-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
.approach-card { padding: 36px; border: 1px solid var(--line); border-radius: 2px; background: #fff; }
.approach-wilson { border-top: 4px solid var(--accent); }
.approach-solo { background: #f7f7f5; border-top: 4px solid #aaa; }
.approach-other { background: #efefec; }
.approach-kicker { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; font-weight: 800; color: var(--accent); margin: 0 0 12px; }
.approach-solo .approach-kicker, .approach-other .approach-kicker { color: #777; }
.approach-card h3 { font: 700 28px/1 'Arial Narrow', Impact, Arial, sans-serif; text-transform: uppercase; margin: 0 0 20px; color: var(--ink); }
.approach-solo h3 { color: #444; }
.approach-row { display: grid; grid-template-columns: 28px 1fr; gap: 10px; padding: 14px 0; border-top: 1px solid var(--line); }
.approach-row p { margin: 0; color: #666; font-size: 14px; }
.approach-row p b { color: #111; }
.approach-icon { font-weight: 900; font-size: 16px; }
.approach-icon.accent { color: var(--accent); }
.approach-icon.muted { color: #999; }

/* PACKAGES (dark) */
.fees.section-dark { background: var(--black); }
.fees.section-dark h2 { color: #fff; }
.fees.section-dark h2 span { color: #a4a4a4; }
.light-heading p:not(.eyebrow) { color: #aaa; }
.package-card { border: 1px solid #333; border-radius: 2px; padding: 40px 36px; background: #111; color: #ddd; }
.package-primary { background: #171717; border-color: #5b151d; box-shadow: inset 0 4px 0 var(--accent); }
.package-classic { background: #151515; border-top: 4px solid #555; }
.pkg-subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: .18em; color: #888; margin: 0 0 12px; }
.package-card h3 { font-family: 'Arial Narrow', Arial, sans-serif; font-size: 40px; text-transform: uppercase; margin: 0 0 16px; color: #fff; }
.pkg-rate { display: flex; align-items: baseline; gap: 10px; margin: 0 0 8px; }
.pkg-rate strong { font: 700 64px/.9 'Arial Narrow', Impact, Arial, sans-serif; color: var(--accent); }
.pkg-rate span { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #888; }
.pkg-tagline { font-size: 14px; color: #aaa; margin: 16px 0 24px; padding-bottom: 24px; border-bottom: 1px solid #333; min-height: 60px; }
.package-card ul { list-style: none; padding: 0; margin: 0 0 32px; border-top: 1px solid #333; }
.package-card ul li { font-size: 14px; padding: 12px 0; border-bottom: 1px solid #333; color: #ccc; }
.package-card ul li::before { content: '✓ '; color: var(--accent); font-weight: 700; }
.button-light { background: #fff; color: var(--black); }

/* RESPONSIVE */
@media (max-width: 768px) {
  .grid-2col { grid-template-columns: 1fr; }
  .network-grid { grid-template-columns: 1fr; gap: 40px; }
  .packages-grid { grid-template-columns: 1fr; }
  .contact-grid { grid-template-columns: 1fr; gap: 40px; }
  .service-grid { grid-template-columns: 1fr; }
  .approach-grid { grid-template-columns: 1fr; }
  .site-nav { display: none; }
  h1 { font-size: clamp(42px, 10vw, 72px); }
  .hero-stats-row { gap: 16px; }
  .marquee-banner { gap: 20px; padding: 16px 20px; }
}
</style>
