/**
 * E2E: Admin dashboard and proposal management.
 *
 * Prerequisites:
 *   - `npm run dev` running with a real POSTGRES_URL
 *   - ADMIN_PASSWORD env matches what's in .env (default: "changeme")
 *
 * Run: npx playwright test tests/e2e/admin-dashboard.spec.ts
 */
import { test, expect } from '@playwright/test'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme'

async function adminLogin(page: any) {
  await page.goto('/admin/login')
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in|log in|submit/i }).click()
  await page.waitForURL('/admin/**', { timeout: 5000 })
}

test.describe('Admin login', () => {
  test('wrong password shows error, does not redirect', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click()
    await page.waitForTimeout(1000)
    // Should still be on login page
    expect(page.url()).toContain('/admin/login')
  })

  test('correct password redirects to admin dashboard', async ({ page }) => {
    await adminLogin(page)
    await expect(page).toHaveURL(/\/admin/)
    // Not on login page anymore
    expect(page.url()).not.toContain('/admin/login')
  })
})

test.describe('Admin dashboard (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page)
  })

  test('dashboard shows proposals table', async ({ page }) => {
    await page.goto('/admin')
    // The dashboard should render a list/table of proposals
    await expect(page.locator('table, [data-testid="proposals-list"], ul')).toBeVisible()
  })

  test('unauthenticated visit to /admin redirects to login', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 })
  })

  test('can navigate to new proposal form', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('link', { name: /new proposal|create/i }).click()
    await expect(page).toHaveURL(/\/admin\/proposals\/new/)
  })
})

test.describe('Proposal creation flow (authenticated)', () => {
  let createdSlug: string

  test.beforeEach(async ({ page }) => {
    await adminLogin(page)
  })

  test('creates a new proposal and lands on its edit page', async ({ page }) => {
    const uniqueSlug = `e2e-${Date.now()}`
    createdSlug = uniqueSlug

    await page.goto('/admin/proposals/new')
    await page.getByLabel(/university name/i).fill('E2E Test University')
    // Slug might be auto-suggested or need manual entry
    const slugField = page.getByLabel(/slug|url/i)
    await slugField.clear()
    await slugField.fill(uniqueSlug)
    await page.getByLabel(/pin/i).fill('4321')
    // Select sport if there's a dropdown
    const sportSelect = page.getByLabel(/sport/i)
    if (await sportSelect.isVisible()) {
      await sportSelect.selectOption('tennis')
    }
    await page.getByRole('button', { name: /create|save/i }).click()

    // Should land on the edit page for the new proposal
    await expect(page).toHaveURL(/\/admin\/proposals\/\d+/, { timeout: 5000 })
  })

  test('rejects slug with uppercase characters', async ({ page }) => {
    await page.goto('/admin/proposals/new')
    await page.getByLabel(/university name/i).fill('Test')
    await page.getByLabel(/slug|url/i).fill('InvalidSlug')
    await page.getByLabel(/pin/i).fill('1234')
    await page.getByRole('button', { name: /create|save/i }).click()
    // Should show error or stay on form
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/admin/proposals/new')
  })

  test('rejects PIN with fewer than 4 digits', async ({ page }) => {
    await page.goto('/admin/proposals/new')
    await page.getByLabel(/university name/i).fill('Test')
    await page.getByLabel(/slug|url/i).fill('test-short-pin')
    await page.getByLabel(/pin/i).fill('12')
    await page.getByRole('button', { name: /create|save/i }).click()
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/admin/proposals/new')
  })
})

test.describe('Proposal on/off toggle (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page)
  })

  test('dashboard shows status for each proposal', async ({ page }) => {
    await page.goto('/admin')
    // Should show live/offline status indicators
    const status = page.getByText(/live|offline/i).first()
    await expect(status).toBeVisible()
  })
})
