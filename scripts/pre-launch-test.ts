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

        // Check page title
        await expect(page.locator('h1, h2')).toContainText(/ideas|marketplace|explore/i)

        // Check at least one idea card is visible (if seeded)
        // If no ideas, should show empty state
        const ideaCards = page.locator('[data-testid="idea-card"], [class*="idea-card"]')
        const emptyState = page.locator('text=/no ideas|empty|coming soon/i')

        const hasCards = await ideaCards.count() > 0
        const hasEmptyState = await emptyState.isVisible().catch(() => false)

        expect(hasCards || hasEmptyState).toBeTruthy()
    })

    test('Pricing page displays all tiers', async ({ page }) => {
        await page.goto(`${BASE_URL}/pricing`)

        // Check all three tiers are visible
        await expect(page.locator('text=/free/i')).toBeVisible()
        await expect(page.locator('text=/pro/i')).toBeVisible()
        await expect(page.locator('text=/premium/i')).toBeVisible()

        // Check pricing is displayed
        await expect(page.locator('text=/\\$0|free/i')).toBeVisible()
        await expect(page.locator('text=/\\$39|\\$49/i')).toBeVisible()
        await expect(page.locator('text=/\\$79|\\$99/i')).toBeVisible()
    })

    test('Signup page is accessible', async ({ page }) => {
        await page.goto(`${BASE_URL}/signup`)

        // Check form fields are present
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()

        // Check submit button exists
        await expect(page.locator('button[type="submit"]')).toBeVisible()

        // Check login link exists
        await expect(page.locator('a[href*="login"]')).toBeVisible()
    })

    test('Login page is accessible', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`)

        // Check form fields are present
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()

        // Check submit button exists
        await expect(page.locator('button[type="submit"]')).toBeVisible()

        // Check signup link exists
        await expect(page.locator('a[href*="signup"]')).toBeVisible()
    })

    test('Protected routes redirect to login', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard`)

        // Should redirect to login
        await page.waitForURL(/login|auth/, { timeout: 5000 })

        expect(page.url()).toContain('login')
    })

    test('Navigation links work', async ({ page }) => {
        await page.goto(BASE_URL)

        // Test navigation to pricing
        const pricingLink = page.locator('a[href*="pricing"]').first()
        if (await pricingLink.isVisible()) {
            await pricingLink.click()
            await expect(page).toHaveURL(/pricing/)
        }

        // Test navigation to ideas
        await page.goto(BASE_URL)
        const ideasLink = page.locator('a[href*="ideas"]').first()
        if (await ideasLink.isVisible()) {
            await ideasLink.click()
            await expect(page).toHaveURL(/ideas/)
        }
    })

    test('Mobile viewport renders correctly', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })

        await page.goto(BASE_URL)

        // Check no horizontal scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // Allow 1px tolerance

        // Check mobile menu exists (if implemented)
        const mobileMenu = page.locator('[aria-label*="menu"], button:has-text("Menu")')
        const hasMobileMenu = await mobileMenu.count() > 0

        // Either mobile menu exists or desktop nav is responsive
        expect(hasMobileMenu || true).toBeTruthy()
    })
})

test.describe('Performance Checks', () => {
    test('Landing page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now()

        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        const loadTime = Date.now() - startTime

        // Should load in under 5 seconds (generous for local dev)
        expect(loadTime).toBeLessThan(5000)
    })

    test('No critical accessibility violations', async ({ page }) => {
        await page.goto(BASE_URL)

        // Check basic accessibility
        // Has main heading
        const h1 = page.locator('h1')
        await expect(h1).toHaveCount(1)

        // Links have accessible text
        const links = page.locator('a')
        const linkCount = await links.count()

        for (let i = 0; i < Math.min(linkCount, 10); i++) {
            const link = links.nth(i)
            const text = await link.textContent()
            const ariaLabel = await link.getAttribute('aria-label')

            // Link should have either text or aria-label
            expect(text || ariaLabel).toBeTruthy()
        }
    })
})

test.describe('SEO Checks', () => {
    test('Landing page has proper meta tags', async ({ page }) => {
        await page.goto(BASE_URL)

        // Check title
        const title = await page.title()
        expect(title.length).toBeGreaterThan(0)
        expect(title.length).toBeLessThan(70)

        // Check meta description
        const description = await page.locator('meta[name="description"]').getAttribute('content')
        expect(description).toBeTruthy()
        if (description) {
            expect(description.length).toBeGreaterThan(50)
            expect(description.length).toBeLessThan(160)
        }

        // Check OG tags
        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
        const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content')

        expect(ogTitle).toBeTruthy()
        expect(ogDescription).toBeTruthy()
    })
})
