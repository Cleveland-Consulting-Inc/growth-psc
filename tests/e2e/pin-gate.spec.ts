/**
 * E2E: Coach-facing PIN gate flow.
 *
 * Prerequisites:
 *   - `npm run dev` running with a real POSTGRES_URL
 *   - A live proposal exists with slug="e2e-test" pin="1234" status="live"
 *   - An offline proposal exists with slug="e2e-offline" status="offline"
 *
 * Create them via the admin panel or directly in the DB before running.
 * Run: npx playwright test tests/e2e/pin-gate.spec.ts
 */
import { test, expect } from '@playwright/test'

const SLUG = process.env.E2E_SLUG ?? 'e2e-test'
const CORRECT_PIN = process.env.E2E_PIN ?? '1234'
const WRONG_PIN = '0000'
const OFFLINE_SLUG = process.env.E2E_OFFLINE_SLUG ?? 'e2e-offline'

test.describe('PIN gate — live proposal', () => {
  test.beforeEach(async ({ context }) => {
    // Clear session cookies so each test starts at the PIN screen
    await context.clearCookies()
  })

  test('shows PIN entry form (not the proposal) on first visit', async ({ page }) => {
    await page.goto(`/${SLUG}/`)
    await expect(page.getByPlaceholder('4-digit PIN')).toBeVisible()
    await expect(page.getByRole('button', { name: 'View Proposal' })).toBeVisible()
  })

  test('shows university name above PIN form', async ({ page }) => {
    await page.goto(`/${SLUG}/`)
    // University name is displayed in h1 above the form
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).not.toBeEmpty()
  })

  test('submit button is disabled until 4 digits are entered', async ({ page }) => {
    await page.goto(`/${SLUG}/`)
    const btn = page.getByRole('button', { name: 'View Proposal' })
    await expect(btn).toBeDisabled()

    await page.getByPlaceholder('4-digit PIN').type('123')
    await expect(btn).toBeDisabled()

    await page.getByPlaceholder('4-digit PIN').type('4')
    await expect(btn).toBeEnabled()
  })

  test('wrong PIN shows error message and clears the field', async ({ page }) => {
    await page.goto(`/${SLUG}/`)
    await page.getByPlaceholder('4-digit PIN').fill(WRONG_PIN)
    await page.getByRole('button', { name: 'View Proposal' }).click()

    await expect(page.getByText('Incorrect PIN')).toBeVisible()
    // Field should be cleared
    await expect(page.getByPlaceholder('4-digit PIN')).toHaveValue('')
  })

  test('wrong PIN does not unlock the proposal', async ({ page }) => {
    await page.goto(`/${SLUG}/`)
    await page.getByPlaceholder('4-digit PIN').fill(WRONG_PIN)
    await page.getByRole('button', { name: 'View Proposal' }).click()
    await page.waitForTimeout(500)

    // Still on the PIN gate — proposal content is not visible
    await expect(page.getByPlaceholder('4-digit PIN')).toBeVisible()
  })

  test('correct PIN unlocks the proposal and shows content', async ({ page }) => {
    await page.goto(`/${SLUG}/`)
    await page.getByPlaceholder('4-digit PIN').fill(CORRECT_PIN)
    await page.getByRole('button', { name: 'View Proposal' }).click()

    // PIN gate should disappear
    await expect(page.getByPlaceholder('4-digit PIN')).not.toBeVisible({ timeout: 5000 })
  })

  test('session persists on reload after correct PIN', async ({ page }) => {
    await page.goto(`/${SLUG}/`)
    await page.getByPlaceholder('4-digit PIN').fill(CORRECT_PIN)
    await page.getByRole('button', { name: 'View Proposal' }).click()
    await expect(page.getByPlaceholder('4-digit PIN')).not.toBeVisible({ timeout: 5000 })

    // Reload — should stay unlocked
    await page.reload()
    await expect(page.getByPlaceholder('4-digit PIN')).not.toBeVisible()
  })

  test('no PIN lockout after multiple wrong attempts', async ({ page }) => {
    await page.goto(`/${SLUG}/`)
    for (let i = 0; i < 5; i++) {
      await page.getByPlaceholder('4-digit PIN').fill(WRONG_PIN)
      await page.getByRole('button', { name: 'View Proposal' }).click()
      await page.waitForTimeout(300)
    }
    // Should still be able to enter a PIN (no lockout)
    await expect(page.getByPlaceholder('4-digit PIN')).toBeVisible()
    // Correct PIN should still work
    await page.getByPlaceholder('4-digit PIN').fill(CORRECT_PIN)
    await page.getByRole('button', { name: 'View Proposal' }).click()
    await expect(page.getByPlaceholder('4-digit PIN')).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('PIN gate — offline proposal', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('shows "not currently available" for offline proposals', async ({ page }) => {
    await page.goto(`/${OFFLINE_SLUG}/`)
    await expect(page.getByText('not currently available')).toBeVisible()
  })

  test('offline proposal does not show PIN input', async ({ page }) => {
    await page.goto(`/${OFFLINE_SLUG}/`)
    await expect(page.getByPlaceholder('4-digit PIN')).not.toBeVisible()
  })

  test('offline proposal shows sport logo', async ({ page }) => {
    await page.goto(`/${OFFLINE_SLUG}/`)
    const logo = page.locator('img')
    await expect(logo.first()).toBeVisible()
  })
})
