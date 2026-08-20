import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  srcDir: 'src',

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0',
      title: 'Growth.PSC',
    },
  },

  runtimeConfig: {
    adminPassword: process.env.ADMIN_PASSWORD ?? 'changeme',
    sessionSecret: process.env.SESSION_SECRET ?? 'dev-secret-32-chars-minimum-len',
  },

  nitro: {
    preset: 'vercel',
    serverAssets: [{ baseName: 'templates', dir: resolve(__dirname, 'src/server/templates') }],
  },
})
