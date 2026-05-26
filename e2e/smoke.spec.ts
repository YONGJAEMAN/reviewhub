import { test, expect } from '@playwright/test';

/**
 * Smoke tests — fast, dependency-free signals the app boots and renders.
 *
 * These should NOT exercise paid integrations (Stripe/Resend/Anthropic) or
 * require a database with seed data. Add deeper flows in separate spec
 * files under e2e/, gated by the integrations they need.
 */

test('landing page loads', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBeLessThan(500);
  // Either the marketing landing or a redirect to /dashboard for logged-in.
  await expect(page).toHaveTitle(/ReviewHub/i);
});

test('login page renders and has expected fields', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
});

test('signup page renders and has expected fields', async ({ page }) => {
  await page.goto('/signup');
  await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
});

test('pricing page lists plans', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page.getByText(/starter/i)).toBeVisible();
  await expect(page.getByText(/growth/i)).toBeVisible();
  await expect(page.getByText(/pro/i)).toBeVisible();
});

test('protected route redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForURL(/\/login/);
  expect(page.url()).toContain('/login');
});

test('security headers are present', async ({ request }) => {
  const res = await request.get('/');
  const headers = res.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBeTruthy();
  expect(headers['content-security-policy']).toBeTruthy();
});

test('robots.txt is served', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('Sitemap');
});
