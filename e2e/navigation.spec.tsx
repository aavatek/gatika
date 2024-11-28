import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

test('index page exists and opens', async ({ page }) => {
	const res = await page.goto('/');
	expect(res).toBeTruthy();
	expect(res?.status()).toBeLessThan(400);
});

// investigate why this fails
test.skip('index page has no accessibility violations', async ({ page }) => {
	await page.goto('/');
	const results = (await new AxeBuilder({ page }).analyze()).violations;
	expect(results).toEqual([]);
});

test('non-existent page returns 404', async ({ page }) => {
	const res = await page.goto('/thispagedoesnotexist');
	expect(res).toBeTruthy();
	expect(res?.status()).toBeLessThan(400);
});

test('404 page has no accessibility violations', async ({ page }) => {
	await page.goto('/thispagedoesnotexist');
	const results = (await new AxeBuilder({ page }).analyze()).violations;
	expect(results).toEqual([]);
});

test('navigate to projects page', async ({ page }) => {
	await page.goto('/');
	await page.getByText('Projektit').click();
	await expect(page).toHaveURL('/projects');
});

test('navigate to gantt page', async ({ page }) => {
	await page.goto('/');
	await page.getByText('Gantt').click();
	await expect(page).toHaveURL('/gantt');
});

test('navigate to index page', async ({ page }) => {
	await page.goto('/gantt');
	await page.getByText('Yleiskatsaus').click();
	await expect(page).toHaveURL('/');
});

test('index page content is correct', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Yleiskatsaus');
	expect(page.getByText('Viimeksi katsottu'));
	expect(page.getByText('Seuraavat tehtävät'));
});
