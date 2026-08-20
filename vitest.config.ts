import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const root = import.meta.dirname

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(root, 'src'),
      '#imports': resolve(root, 'tests/__mocks__/nuxt-imports.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/server/**/*.ts'],
    },
  },
})
