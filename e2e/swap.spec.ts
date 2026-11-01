import { test, expect } from '@playwright/test';

test.describe('Swap Social Platform E2E Flows', () => {
  test('E2E Flow 1: Home Feed exploration, Vibe Swap, and Story inspection', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');

    // 2. Verify Swap branding and interlocking logo are visible
    await expect(page.locator('text=SWAP').first()).toBeVisible();

    // 3. Check 24-hour Stories Tray presence
    await expect(page.locator('text=Your story')).toBeVisible();

    // 4. Test Vibe Swap switching
    const chillFilter = page.locator('button:has-text("Chill")').first();
    if (await chillFilter.isVisible()) {
      await chillFilter.click();
    }

    // 5. Navigate to Waste of Time section via navbar
    const reelsLink = page.locator('a[href="/reels"]').first();
    await expect(reelsLink).toBeVisible();
    await reelsLink.click();

    // 6. Verify URL is /reels
    await expect(page).toHaveURL(/.*reels/);
  });

  test('E2E Flow 2: Waste of Time Reels, Time Wasted HUD, and Profile Analytics', async ({ page }) => {
    // 1. Navigate to Waste of Time reels page
    await page.goto('/reels');

    // 2. Check Time Wasted Meter HUD is visible
    await expect(page.locator('text=wasted').first()).toBeVisible();

    // 3. Navigate to Profile page
    await page.goto('/profile/alex_swap');

    // 4. Verify user profile and anti-addiction tabs
    await expect(page.locator('text=Alex Rivera')).toBeVisible();
    await expect(page.locator('text=Time Wasted Dashboard')).toBeVisible();

    // 5. Switch to Time Wasted Dashboard tab
    await page.locator('button:has-text("Time Wasted Dashboard")').click();
    await expect(page.locator('text=Current Procrastinator Badge')).toBeVisible();
    await expect(page.locator('text=7-Day Waste of Time History')).toBeVisible();
  });

  test('E2E Flow 3: Swap Signature Features (Swap Duets & Swap Day)', async ({ page }) => {
    // 1. Visit Swap Duets page
    await page.goto('/duets');
    await expect(page.locator('text=Swap Duets').first()).toBeVisible();
    await expect(page.locator('text=Send Challenge').first()).toBeVisible();

    // 2. Visit Swap Day page
    await page.goto('/swap-day');
    await expect(page.locator('text=Daily Mutual Match').first()).toBeVisible();
    await expect(page.locator('text=Daily Vibe Note').first()).toBeVisible();
  });
});

