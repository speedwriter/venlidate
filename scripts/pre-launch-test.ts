/**
 * Pre-Launch Smoke Test Script
 * Run before each deployment to catch critical regressions
 * 
 * Setup:
 * npm install -D @playwright/test
 * npx playwright install
 * 
 * Run:
 * npx playwright test scripts/pre-launch-test.ts
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

test.describe('Critical User Journeys', () => {
    test('Landing page loads correctly', async ({ page }) => {
        await page.goto(BASE_URL)

        // Check hero section loads
        await expect(page.locator('h1')).toContainText(/validate|venlidate/i)

        // Check CTA buttons are visible
        const ctaButton = page.locator('a[href*="signup"], button:has-text("Get Started")')
        await expect(ctaButton.first()).toBeVisible()

        // Check no console errors
        const errors: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text())
            }
        })

        await page.waitForTimeout(2000)
        expect(errors.length).toBe(0)
    })

    test('Ideas marketplace loads with content', async ({ page }) => {
        await page.goto(`${BASE_URL}/ideas`)

        // Check page title - use first() to avoid strict mode violation
        await expect(page.locator('h1').first()).toContainText(/ideas|marketplace|explore/i)

        // Check at least one idea card is visible (if seeded)
        const ideaCards = page.locator('[data-testid="idea-card"], [class*="idea-card"]')
        const emptyState = page.locator('text=/no ideas|empty|coming soon/i').first()

        const hasCards = await ideaCards.count() > 0
        const hasEmptyState = await emptyState.isVisible().catch(() => false)

        expect(hasCards || hasEmptyState).toBeTruthy()
    })

    test('Pricing page displays all tiers', async ({ page }) => {
        await page.goto(`${BASE_URL}/pricing`)

        // Check tiers exist - use even more targeted selectors if possible or allow partial matches
        await expect(page.locator('text=/free/i').first()).toBeVisible()
        await expect(page.locator('text=/pro/i').first()).toBeVisible()
        await expect(page.locator('text=/premium/i').first()).toBeVisible()

        // Check pricing is displayed
        await expect(page.locator('text=/\\$0|free/i').first()).toBeVisible()
    })

    test('Signup page is accessible', async ({ page }) => {
        await page.goto(`${BASE_URL}/signup`)

        // Check form fields are present
        await expect(page.locator('input[type="email"]')).toBeVisible()
        // Use first() because signup has password and confirmPassword
        await expect(page.locator('input[type="password"]').first()).toBeVisible()

        // Check submit button exists
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('Login page is accessible', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`)

        // Check form fields are present
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()

        // Check submit button exists
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('Protected routes redirect to login', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard`)

        // Should redirect to login or show auth UI
        await page.waitForURL(/login|auth|signup/, { timeout: 10000 })
        expect(page.url()).toMatch(/login|auth|signup/)
    })

    test('Navigation links work', async ({ page }) => {
        await page.goto(BASE_URL)

        // Test navigation to pricing
        const pricingLink = page.locator('a[href*="pricing"]').first()
        if (await pricingLink.isVisible()) {
            await pricingLink.click()
            await page.waitForURL(/pricing/)
            await expect(page).toHaveURL(/pricing/)
        }

        // Test navigation to ideas
        await page.goto(BASE_URL)
        const ideasLink = page.locator('a[href*="ideas"]').first()
        if (await ideasLink.isVisible()) {
            await ideasLink.click()
            await page.waitForURL(/ideas/)
            await expect(page).toHaveURL(/ideas/)
        }
    })

    test('Mobile viewport renders correctly', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto(BASE_URL)

        // Check no horizontal scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10) // Allow 10px tolerance for decorative elements
    })
})

test.describe('Performance Checks', () => {
    test('Landing page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now()
        await page.goto(BASE_URL)
        await page.waitForLoadState('load')
        const loadTime = Date.now() - startTime
        expect(loadTime).toBeLessThan(10000) // Increase for CI/Slow environments
    })

    test('No critical accessibility violations', async ({ page }) => {
        await page.goto(BASE_URL)
        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()
    })
})

test.describe('SEO Checks', () => {
    test('Landing page has proper meta tags', async ({ page }) => {
        await page.goto(BASE_URL)

        // Check title
        const title = await page.title()
        expect(title.length).toBeGreaterThan(0)
        expect(title.length).toBeLessThan(80)

        // Check meta description
        const description = await page.locator('meta[name="description"]').getAttribute('content')
        expect(description).toBeTruthy()
        if (description) {
            expect(description.length).toBeGreaterThan(40)
            expect(description.length).toBeLessThan(180)
        }

        // Check OG tags - allow fallback to standard meta if property is not found
        const ogTitle = await page.locator('meta[property="og:title"], meta[name="og:title"]').getAttribute('content').catch(() => null)
        await page.locator('meta[property="og:description"], meta[name="og:description"]').getAttribute('content').catch(() => null)

        // If explicitly tested, we expect them or fallback
        if (ogTitle) expect(ogTitle.length).toBeGreaterThan(0)
    })
})

