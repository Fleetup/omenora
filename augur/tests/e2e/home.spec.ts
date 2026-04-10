import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display brand name', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1.brand-name')).toContainText('OMENORA')
  })

  test('should have working CTA button', async ({ page }) => {
    await page.goto('/')
    await page.click('.cta-button')
    await expect(page).toHaveURL('/analysis')
  })

  test('should have correct meta tags', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Free AI Astrology Reading/)
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('.cta-button')).toBeVisible()
  })
})

test.describe('Analysis Flow', () => {
  test('should navigate through analysis steps', async ({ page }) => {
    await page.goto('/analysis')
    await expect(page.locator('text=Tell us about yourself')).toBeVisible()
  })
})

test.describe('Legal Pages', () => {
  test('privacy policy should be accessible', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1')).toContainText('Privacy Policy')
  })

  test('terms of service should be accessible', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('h1')).toContainText('Terms of Service')
  })
})
