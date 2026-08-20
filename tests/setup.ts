// Polyfill Nuxt/Nitro auto-imports that are injected at runtime
// These must be defined before any server module is imported.
;(globalThis as any).defineEventHandler = (fn: any) => fn
;(globalThis as any).useRuntimeConfig = () => ({
  adminPassword: 'secret123',
  sessionSecret: 'test-secret-32-chars-minimum-len!!',
})
